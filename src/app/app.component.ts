import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  depatureDate: any;
  airportName: any;
  flightNum: any;

  constructor(
    private firestore: AngularFirestore,
    private datepipe: DatePipe) {

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
    if (!this.flightNum) {
      alert('Flight number required!');
    } else if (!this.airportName) {
      alert('Please select airport name!');
    } else if (!this.depatureDate) {
      alert('Please select departure date!');
    } else {

      let payload = {
        dept_airport: this.airportName,
        depart_date: this.depatureDate,
        flight_no: this.flightNum
      }

      this.firestore.collection("FlightInfo").get().subscribe(querySnapshot => {
        if (querySnapshot.empty) {
          console.log("no collection");
          this.firestore.collection('FlightInfo').add(payload);
          alert('Flight added successfullly!');
        } else {
          let isFligthExist = false;
          querySnapshot.forEach(doc => {
            if (doc.data().dept_airport == payload.dept_airport) {
              if (doc.data().flight_no == payload.flight_no) {
                if (doc.data().depart_date == payload.depart_date) {
                  isFligthExist = true;
                  alert('Flight already exist!');
                }
              }
            }
          });

          if (!isFligthExist) {
            this.firestore.collection('FlightInfo').add(payload);
            alert('Flight added successfullly!');
          }
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  findFlight() {
    if (!this.flightNum) {
      alert('Flight number required!');
    } else if (!this.airportName) {
      alert('Please select airport name!');
    } else if (!this.depatureDate) {
      alert('Please select departure date!');
    } else {

      let payload = {
        dept_airport: this.airportName,
        depart_date: this.depatureDate,
        flight_no: this.flightNum
      }

      this.firestore.collection("FlightInfo").get().subscribe(querySnapshot => {
        if (querySnapshot.empty) {
          alert("No flights available!");
        } else {
          let isFligthExist = false;
          querySnapshot.forEach(doc => {
            if (doc.data().dept_airport == payload.dept_airport) {
              if (doc.data().flight_no == payload.flight_no) {
                if (doc.data().depart_date == payload.depart_date) {
                  isFligthExist = true;
                  console.log(doc.id);
                  this.firestore.collection('FlightInfo').doc(doc.id).collection("Passengers").get().subscribe(passenger => {
                    if (passenger.empty) {
                      alert("No passengers found!");
                    } else {
                      let passengerInfo = [];
                      passenger.forEach(doc => {
                        passengerInfo.push(doc.data());
                      });
                      console.log(passengerInfo);
                    }
                  }, (error) => {
                    console.log(error);
                  });
                }
              }
            }
          });

          if (!isFligthExist) {
            alert('No flights available');
          }
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  findFlightByAirport() {

  }
}
