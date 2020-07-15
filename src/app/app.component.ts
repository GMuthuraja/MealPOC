import { Component, ViewChild } from '@angular/core';
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
  currentDate = new Date();

  @ViewChild('departDate') departDate;
  @ViewChild('airportName') airportName;
  @ViewChild('stationName') stationName;
  @ViewChild('flightNum') flightNum;

  constructor(
    private firestore: AngularFirestore,
    private datePipe: DatePipe,
    private httpClient: HttpClient) {

    this.fetchAirportList();

    //this.firestore.doc('FlightInfo/' +payload.flight_no).update(res);
    //this.firestore.doc('FlightInfo/' + payload.flight_no).delete();

    // let passenger = {
    //   pass_name: 'Peter Parker',
    //   book_ref: 'KDL009484',
    //   dept_airport: 'Jeddah [King Abdul Aziz Airport]',
    //   arr_airport: 'Riyadh [King Khalid Airport]',
    //   eticket_ref: 'SV009484',
    //   update_date: this.datepipe.transform(new Date(), 'dd/MM/yyyy')
    // }
  }

  addFlight() {

    let flightNum = this.flightNum.nativeElement.value;
    let airportName = this.airportName.nativeElement.value;
    let departDate = this.departDate.nativeElement.value;

    if (!flightNum) {
      alert('Flight number required.');
    } else if (!airportName) {
      alert('Please select the airport.');
    } else if (!departDate) {
      alert('Please select the departure date.');
    } else {

      let payload = {
        flight_no: flightNum,
        dept_airport: airportName,
        depart_date: departDate
      }

      this.firestore.collection("FlightInfo").get().subscribe(q => {
        if (q.empty) {
          console.log("no collection");
          this.firestore.collection('FlightInfo').add(payload);
          alert('Flight added successfullly.');
        } else {
          let isFligthExist = false;
          q.forEach(doc => {
            if (doc.data().dept_airport == payload.dept_airport) {
              if (doc.data().flight_no == payload.flight_no) {
                if (doc.data().depart_date == payload.depart_date) {
                  isFligthExist = true;
                  alert('Flight already exist.');
                }
              }
            }
          });

          if (!isFligthExist) {
            this.firestore.collection('FlightInfo').add(payload);
            alert('Flight added successfullly.');
          }
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  findPassengerByFlight() {

    let flightNum = this.flightNum.nativeElement.value;
    let airportName = this.airportName.nativeElement.value;
    let departDate = this.departDate.nativeElement.value;

    if (!flightNum) {
      alert('Flight number required.');
    } else if (!airportName) {
      alert('Please select the airport.');
    } else if (!departDate) {
      alert('Please select the departure date.');
    } else {

      let payload = {
        flight_no: flightNum,
        dept_airport: airportName,
        depart_date: departDate
      }

      this.firestore.collection("FlightInfo").get().subscribe(r => {
        let isFligthExist = false;
        if (r.empty) {
          alert("No flights available.");
        } else {
          r.forEach(doc => {
            if (doc.data().dept_airport == payload.dept_airport) {
              if (doc.data().flight_no == payload.flight_no) {
                if (doc.data().depart_date == payload.depart_date) {
                  isFligthExist = true;
                  console.log(doc.id);
                  this.firestore.collection('FlightInfo').doc(doc.id).collection("Passengers").get().subscribe(p => {
                    if (p.empty) {
                      alert("No passengers found.");
                    } else {
                      this.passengerInfo = [];
                      p.forEach(doc => {
                        this.passengerInfo.push(doc.data());
                      });
                      console.log(this.passengerInfo);
                    }
                  }, (error) => {
                    console.log(error);
                  });
                }
              }
            }
          });

          if (!isFligthExist) {
            alert('No flights available.');
          }
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  findPassengerByStation() {

    let stationName = this.stationName.nativeElement.value;

    if (!stationName) {
      alert('Please select the airport.');
    } else {
      let payload = {
        dept_airport: stationName
      }

      this.firestore.collection("FlightInfo").get().subscribe(r => {
        let isFligthExist = false;
        if (r.empty) {
          alert("No flights available.");
        } else {
          r.forEach(doc => {
            if (doc.data().dept_airport == payload.dept_airport) {
              isFligthExist = true;
              console.log(doc.id);
              this.firestore.collection('FlightInfo').doc(doc.id).collection("Passengers").get().subscribe(p => {
                this.passengerInfo = [];
                p.forEach(doc => {
                  this.passengerInfo.push(doc.data());
                });
              }, (error) => {
                console.log(error);
              });
            }
          });

          console.log(this.passengerInfo);

          if (!isFligthExist) {
            alert('No flights available.');
          }

          if (this.passengerInfo.length == 0 && isFligthExist) {
            alert('No passengers available.');
          }
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  fetchAirportList() {
    this.httpClient.get('assets/json/airports.json').subscribe(r => {
      this.airportList = r['Airports'];
    }, (error) => {
      console.log(error);
    });
  }

  restrictSpecialChars(event) {
    var regex = new RegExp("^[a-zA-Z0-9]+$");
    if (!regex.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^a-zA-Z0-9]/g, "");
    }
  }
}
