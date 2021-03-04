import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from "@angular/router"
import { FireService } from '../services/fire.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { element } from 'protractor';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  private snapshotChangesSubscription: any;
  sorted$;
  items: Array<any>;
  user: any;
  isLoggedin:boolean = false;
  public loadedGoalList: any[];
  diffSelect;
  uniqeIng: string[];
  maxTime:number;  
  minTime:number;
  minServings:number;
  maxServings:number;
  ionrange1;
  ionrange2;

  isChecked = "title";
  
    totalItems = "";
    ingCount = "";
    easy = "";
    medium = "";
    hard = "";

  firestoredata: any;
  title: string;
  time: string;
  difficulty = "Easy";
  serves: string;
  ingredients: string;
  ingredientsArray: string[];
  instructions: string;

  constructor(private firestore: AngularFirestore,
    private router: Router,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    public fireauth: AngularFireAuth,
    private fireService: FireService) {      
  }

  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      message: 'Loading data from database...'
    });
    this.presentLoading(loading);
    //if(this.isChecked=="ingCount")
    return this.firestore.collection("db").doc("r1").collection("recipes", ref => ref.orderBy(this.isChecked)).snapshotChanges()
      .subscribe(data => {
        this.items = data;
        this.loadedGoalList = data;
        //sort
        this.sortList();
        //stats update 
        this.totalItems = data.length.toString();
        let ingSet = new Set();
        var temp=0; 
        var timeArray = [];
        var servingArray = [];
        for (let index = 0; index < data.length; index++) {          
          for (let j = 0; j < data[index].payload.doc.data().ingredients.length; j++) {          
          ingSet.add(data[index].payload.doc.data().ingredients[j]);           

            if(data[index].payload.doc.data().difficulty.toLowerCase()=="easy")             
             temp++;          
          }          
          timeArray.push(data[index].payload.doc.data().time);
          servingArray.push(data[index].payload.doc.data().serves);
        }                
        document.getElementById("uniqueIng").innerHTML = "[";
        Array.from(ingSet).sort().forEach(element => {                  
          // console.log(element);          
          document.getElementById("uniqueIng").innerHTML += element + ",";
        });
        document.getElementById("uniqueIng").innerHTML += " ]";
        this.ingCount = ingSet.size.toString();
        this.maxTime = Math.max.apply(Math, timeArray);
        this.minTime = Math.min.apply(Math, timeArray);
        this.maxServings = Math.max.apply(Math, servingArray);
        this.minServings = Math.min.apply(Math, servingArray);
        this.ionrange1 = {lower:this.minTime,upper:this.maxTime};
        this.ionrange2 = {lower:this.minServings,upper:this.maxServings};
        this.easy = temp.toString();
                
        loading.dismiss();
      });
  }

  async Add() {
    this.ingredientsArray = this.ingredients.replace(/,\s*/g, ',').split(',').filter(function(v){return v!==''});

    const loading = await this.loadingCtrl.create({
      message: 'Adding data in database...'
    });
    this.presentLoading(loading);
    this.firestore.collection("db").doc("r1").collection("recipes").add({
      title: this.title,
      time: this.time,
      difficulty: this.difficulty,
      serves: this.serves,
      ingredients: this.ingredientsArray,
      instructions: this.instructions
    });
    loading.dismiss();
    this.sortList();
    this.resetFields();
  }
  delete(id) {
    this.firestore.collection("db").doc("r1").collection("recipes").doc(id).delete();
  }
  itemIdForUpdate: string;
  edit(item) {
    this.resetFields();
    this.ingredientsArray = [""];
    var d = item.payload.doc.data();
    this.title = d.title;
    this.time = d.time;
    this.difficulty = d.difficulty;
    this.serves = d.serves;
    for (var i = 0; i < d.ingredients.length; i++) {
      this.ingredients += d.ingredients[i];
      if (i != (d.ingredients.length - 1))
        this.ingredients += ",";
    }
    this.instructions = d.instructions;
    this.itemIdForUpdate = item.payload.doc.id;
  }
  resetFields() {
    this.title = "";
    this.time = "";
    this.difficulty = "";
    this.serves = "";
    this.ingredients = "";
    this.instructions = "";
  }
  async update(itemIdForUpdate) {
    this.ingredientsArray = this.ingredients.replace(/,\s*/g, ',').split(',').filter(function(v){return v!==''});

    const loading = await this.loadingCtrl.create({
      message: 'Updating...'
    });
    this.presentLoading(loading);
    return new Promise<any>((resolve, reject) => {
      this.firestore.collection("db").doc("r1").collection("recipes").doc(itemIdForUpdate).update({
        title: this.title,
        time: this.time,
        difficulty: this.difficulty,
        serves: this.serves,
        ingredients: this.ingredientsArray,
        instructions: this.instructions
      }).then(res => resolve(res),
        err => reject(err)

      )
      loading.dismiss();
      this.sortList();
      this.resetFields();
    });

  }  

  async presentLoading(loading) {
    return await loading.present();
  }
  gotoDetails(item) {
    this.fireService.currentRecipe = item;
    this.router.navigate(['/detail']);
  }
  toggle_visibility() {
    var e = document.getElementById("accord-content");
    var f = document.getElementById("accord");
    if (e.style.display == 'block')
      e.style.display = 'none';
    else {
      e.style.display = 'block';
      f.style.color = '$primary';
      f.style.background = '$primary';
    }

  }
  sortList() {
    this.items.sort((o1,o2) => {
      const param = this.isChecked;      
      if(this.isChecked == "ingCount")
      {
        if(o1.payload.doc.data().ingredients.length > o1.payload.doc.data().ingredients.length) return 1;
        else if(o1.payload.doc.data().ingredients.length < o1.payload.doc.data().ingredients.length) return -1;
      }      
      else if (o1.payload.doc.data()[param] > o2.payload.doc.data()[param]) return 1;
      else if (o1.payload.doc.data()[param] < o2.payload.doc.data()[param]) return -1;
      else 0;
    });    
  }
  initializeItems(): void {
    this.items = this.loadedGoalList;
  }
  filterList(evt) {
    this.initializeItems();
  
    const searchTerm = evt.srcElement.value;
    const searchParam = this.isChecked;
  
    if (!searchTerm) {
      return;
    }    
    this.items = this.items.filter(val => {
      val = val.payload.doc.data();            
      if(searchParam == "time" || searchParam =="serves")
      {        
        if(searchParam == "time")
          return val.time === parseInt(searchTerm);
        if(searchParam =="serves")
          return val.serves === parseInt(searchTerm);
      }        
      else if(searchParam == "ingredients")
      {
        var arr = val.ingredients;
        for(var k = 0; k < arr.length; k++){
          if(arr[k].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1){
              return true;
          }
      }
        
      }
      else if (val[searchParam] && searchTerm) {
        if (val[searchParam].toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          return true;
        }
        return false;        
      }      
    });
  }
  filterDifficulty() {    
    this.items = this.items.filter(val => {
      val = val.payload.doc.data();                        
      console.log("diffSelect: " + this.diffSelect)
        return (val.difficulty.toLowerCase().indexOf(this.diffSelect) > -1);      
    });
  }
  timeRangeFilter() {
    this.initializeItems();
      
    this.items = this.items.filter(val => {
      val = val.payload.doc.data();                  
      if(this.ionrange1.lower >=this.minTime || this.ionrange1.upper <=this.maxTime)
      {        
        if((this.ionrange1.lower <= val.time) && (this.ionrange1.upper >=val.time))
        {
          console.log("lower:" + this.ionrange1.lower + ", upper:" + this.ionrange1.upper);
          return true;
        }          
      }              
      else return false;                    
    });
    this.sortList();
  }
  servingRangeFilter() {
    this.initializeItems();
      
    this.items = this.items.filter(val => {
      val = val.payload.doc.data();                  
      if(this.ionrange2.lower >=this.minServings || this.ionrange2.upper <=this.maxServings)
      {        
        if((this.ionrange2.lower <= val.serves) && (this.ionrange2.upper >=val.serves))
        {
          console.log("lower:" + this.ionrange2.lower + ", upper:" + this.ionrange2.upper);
          return true;
        }          
      }              
      else return false;                    
    });
    this.sortList();
  }
  
  logout() {

    this.fireauth.auth.signOut().then(() => {

      this.router.navigate(['/login']);

    })

  }
  ionViewDidEnter() {
    this.fireauth.auth.onAuthStateChanged((user) => {
      if (user) {
        this.user = user;
        console.log(this.user.email);
        this.isLoggedin = true;
      }
      else this.isLoggedin = false;
    })

  }
}
