import { Component, ViewChild } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from "@angular/common/http";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  airportList: any;
  passengerInfo = [];
  currentDate: any;
  minDate: any;
  showLoader: boolean = false;
  flightNum: any;

  @ViewChild('departDate') departDate;
  @ViewChild('airportName') airportName;
  @ViewChild('stationName') stationName;

  constructor(
    private firestore: AngularFirestore,
    private datePipe: DatePipe,
    private alertController: AlertController,
    private httpClient: HttpClient) {
    this.initialize();

    //this.firestore.doc('FlightInfo/' +payload.flight_no).update(res);
    //this.firestore.doc('FlightInfo/' + payload.flight_no).delete();

    // let passenger = {
    //   pass_name: 'Muthuraja',
    //   book_ref: 'KDL009484',
    //   dept_airport: 'Addis Ababa [Bole], Ethiopia',
    //   dept_code: 'ADD',
    //   arr_airport: 'Abha, Saudi Arabia',
    //   arr_code: 'AHB',
    //   eticket_ref: 'SV23890',
    //   update_date: this.datePipe.transform(new Date(), 'dd/MM/yyyy')
    // }

    //this.firestore.collection('FlightInfo').doc('PfhTH4b8CX5QNyriN3Ar').collection('Passengers').add(passenger);
  }

  initialize() {
    this.fetchAirportList();
    this.currentDate = new Date();
    this.minDate = this.datePipe.transform(new Date, 'yyyy-MM-dd');
    this.flightNum = '';
  }


  addFlight() {
    let airportName = this.airportName.nativeElement.value;
    let departDate = this.departDate.nativeElement.value;

    if (!this.flightNum) {
      this.notify('Flight number required.');
    } else if (!airportName) {
      this.notify('Please select the airport.');
    } else if (!departDate) {
      this.notify('Please select the departure date.');
    } else {

      let payload = {
        flight_no: this.flightNum,
        dept_airport: airportName,
        airport_code: airportName.split('-')[0].trim(),
        depart_date: departDate
      }

      this.passengerInfo = [];
      this.showLoader = true;
      this.firestore.collection("FlightInfo").get().subscribe(q => {
        if (q.empty) {
          console.log("FlightInfo>>>>>>>no collection");
          this.firestore.collection('FlightInfo').add(payload);
          this.notify('Flight added successfullly.');
          this.initialize();
        } else {
          let isFligthExist = false;
          q.forEach(doc => {
            if (doc.data().airport_code == payload.airport_code) {
              if (doc.data().flight_no == payload.flight_no) {
                if (doc.data().depart_date == payload.depart_date) {
                  isFligthExist = true;
                  this.notify('Flight already exist.');
                }
              }
            }
          });

          if (!isFligthExist) {
            this.firestore.collection('FlightInfo').add(payload);
            this.notify('Flight added successfullly.');
            this.initialize();
          }
        }
        this.showLoader = false;
      }, (error) => {
        console.log(error);
        this.showLoader = false;
      });
    }
  }


  findPassengerByFlight() {
    let airportName = this.airportName.nativeElement.value;
    let departDate = this.departDate.nativeElement.value;

    if (!this.flightNum) {
      this.notify('Flight number required.');
    } else if (this.flightNum.length < 4) {
      this.notify('Flight number is not valid.');
    } else if (!airportName) {
      this.notify('Please select the airport.');
    } else if (!departDate) {
      this.notify('Please select the departure date.');
    } else {

      let payload = {
        flight_no: this.flightNum,
        dept_airport: airportName,
        airport_code: airportName.split('-')[0].trim(),
        depart_date: departDate,
      }

      this.showLoader = true;
      this.firestore.collection("FlightInfo").get().subscribe(r => {
        let isFligthExist = false;
        if (r.empty) {
          this.notify("No flights available.");
          this.passengerInfo = [];
        } else {
          this.passengerInfo = [];
          r.forEach(doc => {
            if (doc.data().airport_code == payload.airport_code) {
              if (doc.data().flight_no == payload.flight_no) {
                if (doc.data().depart_date == payload.depart_date) {
                  isFligthExist = true;
                  console.log(doc.id);
                  this.firestore.collection('FlightInfo').doc(doc.id).collection("Passengers").get().subscribe(p => {
                    p.forEach(doc => {
                      this.passengerInfo.push(doc.data());
                    });
                    console.log(this.passengerInfo);
                  }, (error) => {
                    console.log(error);
                  });
                }
              }
            }
          });

          if (!isFligthExist) {
            this.notify('No flights available.');
            this.passengerInfo = [];
          }

          setTimeout(() => {
            if (this.passengerInfo.length == 0 && isFligthExist) {
              this.notify('No passengers found.');
            }
          }, 1000);
        }
        this.showLoader = false;
      }, (error) => {
        this.showLoader = false;
        console.log(error);
      });
    }
  }


  findPassengerByStation() {
    let stationName = this.stationName.nativeElement.value;

    if (!stationName) {
      this.notify('Please select the airport.');
    } else {
      let payload = {
        dept_airport: stationName,
        airport_code: stationName.split('-')[0].trim(),
      }

      this.showLoader = true;
      this.firestore.collection("FlightInfo").get().subscribe(r => {
        let isFligthExist = false;
        if (r.empty) {
          this.notify("No flights available.");
          this.passengerInfo = [];
        } else {

          this.passengerInfo = [];
          r.forEach(doc => {
            if (doc.data().airport_code == payload.airport_code) {
              isFligthExist = true;
              console.log(doc.id);
              this.firestore.collection('FlightInfo').doc(doc.id).collection("Passengers").get().subscribe(p => {
                p.forEach(doc => {
                  console.log(doc.data());
                  this.passengerInfo.push(doc.data());
                });
              }, (error) => {
                console.log(error);
              });
            }
          });

          if (!isFligthExist) {
            this.notify('No flights available.');
            this.passengerInfo = [];
          }

          setTimeout(() => {
            if (this.passengerInfo.length == 0 && isFligthExist) {
              this.notify('No passengers found.');
            }
          }, 1000);
        }
        this.showLoader = false;
      }, (error) => {
        this.showLoader = false;
        console.log(error);
      });
    }
  }

  fetchAirportList() {
    this.httpClient.get('https://run.mocky.io/v3/dcf43445-82d1-4eca-a051-d3752a5bdf56').subscribe(r => {
      this.airportList = r['Airports'];
    }, (error) => {
      console.log(error);
    });
  }

  restrictSpecialChars(event) {
    var regex = new RegExp("^[0-9]+$");
    if (!regex.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9]/g, "");
    }
  }

  async notify(msg) {
    const alert = await this.alertController.create({
      header: 'eStaff Meal',
      message: msg,
      backdropDismiss: false,
      buttons: ['OK']
    });

    await alert.present();
  }
}
