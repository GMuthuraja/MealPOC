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
  //maxDate: any;
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
  }

  initialize() {
    this.fetchAirportList();
    this.currentDate = new Date();
    this.minDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    // var twoday = new Date();
    // var numberOfDaysToAdd = 2;
    // twoday.setDate(twoday.getDate() + numberOfDaysToAdd);
    // this.maxDate = this.datePipe.transform(twoday, 'yyyy-MM-dd');
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
        dept_code: airportName.split('-')[0].trim(),
        depart_date: departDate
      }

      this.passengerInfo = [];
      this.showLoader = true;
      this.firestore.collection("FlightInfo").get().subscribe(f => {
        if (f.empty) {
          console.log("FlightInfo>>>>>>>no collection");
          this.firestore.collection('FlightInfo').add(payload);
          this.notify('Flight added successfullly.');
          this.initialize();
        } else {
          let isFligthExist = false;
          f.forEach(flight => {
            if (flight.data().dept_code == payload.dept_code) {
              if (flight.data().flight_no == payload.flight_no) {
                if (flight.data().depart_date == payload.depart_date) {
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
        dept_code: airportName.split('-')[0].trim(),
        depart_date: departDate,
      }

      this.showLoader = true;
      this.firestore.collection("FlightInfo").get().subscribe(r => {
        let isFligthExist = false;
        if (r.empty) {
          this.notify("No records found.");
          this.passengerInfo = [];
        } else {
          this.passengerInfo = [];
          r.forEach(flight => {
            if (flight.data().dept_code == payload.dept_code) {
              if (flight.data().flight_no == payload.flight_no) {
                if (flight.data().depart_date == payload.depart_date) {
                  isFligthExist = true;
                  console.log(flight.id);
                  this.firestore.collection('FlightInfo').doc(flight.id).collection("Passengers").get().subscribe(p => {
                    p.forEach(passenger => {
                      console.log(passenger.data());
                      this.passengerInfo.push({ fid: flight.id, pid: passenger.id, data: passenger.data() });
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
            this.notify('No records found.');
            this.passengerInfo = [];
          }

          setTimeout(() => {
            if (this.passengerInfo.length == 0 && isFligthExist) {
              this.notify('No records found.');
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
        dept_code: stationName?.split('-')[0].trim(),
      }

      this.initialize();
      this.showLoader = true;
      this.firestore.collection("FlightInfo").get().subscribe(r => {
        let isFligthExist = false;
        if (r.empty) {
          this.notify("No records found.");
          this.passengerInfo = [];
        } else {

          this.passengerInfo = [];
          r.forEach(flight => {
            if (flight.data().dept_code == payload.dept_code) {
              isFligthExist = true;
              console.log(flight.id);
              this.firestore.collection('FlightInfo').doc(flight.id).collection("Passengers").get().subscribe(p => {
                p.forEach(passenger => {
                  console.log(passenger.data());
                  this.passengerInfo.push({ fid: flight.id, pid: passenger.id, data: passenger.data() });
                });
              }, (error) => {
                console.log(error);
              });
            }
          });

          if (!isFligthExist) {
            this.notify('No records found.');
            this.passengerInfo = [];
          }

          setTimeout(() => {
            if (this.passengerInfo.length == 0 && isFligthExist) {
              this.notify('No records found.');
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


  async delete(fid, pid, index) {
    console.log('Flight>>>>>>>', fid);
    console.log('Passenger>>>>>>>', pid);
    console.log('Index>>>>>>>', index);

    let confirm = await this.alertController.create({
      header: 'eStaff Meal',
      message: 'Are you sure to delete this passenger?',
      backdropDismiss: false,
      buttons: [
        {
          text: 'CANCEL',
          handler: () => {
            confirm.dismiss(false);
            return false;
          }
        }, {
          text: 'OK',
          handler: () => {
            confirm.dismiss(true);
            return false;
          }
        }
      ]
    });

    //open confirm popup
    await confirm.present();

    //on dismiss confirm popup after press 'Yes' or 'No'
    await confirm.onDidDismiss().then(data => {
      console.log(data);
      if (data.data) {
        this.firestore.collection('FlightInfo').doc(fid).collection('Passengers').doc(pid).delete().then(r => {
          this.passengerInfo.splice(index, 1);
        }).catch(error => {
          console.log(error);
        });
      }
    });
  }


  fetchAirportList() {
    this.showLoader = true;
    this.httpClient.get('https://run.mocky.io/v3/dcf43445-82d1-4eca-a051-d3752a5bdf56').subscribe(r => {
      this.airportList = r['Airports'];
      this.showLoader = false;
    }, (error) => {
      console.log(error);
      this.showLoader = false;
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

    //this.firestore.doc('FlightInfo/' +payload.flight_no).update(res);
    //this.firestore.doc('FlightInfo/' + payload.flight_no).delete();