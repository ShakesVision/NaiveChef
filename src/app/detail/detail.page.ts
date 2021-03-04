import { Component, OnInit } from '@angular/core';
import { FireService } from '../services/fire.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
recipe;
ingCount:number;
  constructor(private fireService: FireService) { }

  ngOnInit() {
    this.recipe = this.fireService.currentRecipe.payload.doc.data();
    this.ingCount = this.recipe.ingredients.length;
    
    var instrnArray = this.recipe.instructions.split('\n');
    document.getElementById("instrn").innerHTML = "";
    for (var I = 0; I < instrnArray.length; I++) {
      var nameList = "<li>" + instrnArray[I] + "</li>";
      document.getElementById("instrn").innerHTML += nameList;
    }
  }

}
