
const CATEGORIES = ["Sacramenten","Bijbel","Jezus","Feesten","Tien geboden","Parabels","Symbolen","Wereldgodsdiensten",
  "Godsdiensten","Christendom","Levensbeschouwingen","Islam","Hindoeïsme en boeddhisme","Algemene kennis"];

const BUILTIN_QUESTIONS = [
  {id:1, category:"Sacramenten", difficulty:"easy", question:"Hoeveel sacramenten kent de katholieke Kerk?", answers:["5","7","9","12"], correct:1, explanation:"De katholieke Kerk kent zeven sacramenten."},
  {id:2, category:"Sacramenten", difficulty:"easy", question:"Welk sacrament hoort bij de eerste communie?", answers:["Doopsel","Eucharistie","Vormsel","Ziekenzalving"], correct:1, explanation:"Bij de eerste communie ontvang je voor het eerst de Eucharistie."},
  {id:3, category:"Bijbel", difficulty:"easy", question:"Wie bouwde volgens het Bijbelverhaal de ark?", answers:["Mozes","Noach","Abraham","David"], correct:1, explanation:"Noach bouwde de ark om mens en dier te redden van de zondvloed."},
  {id:4, category:"Feesten", difficulty:"easy", question:"Wat betekent Advent?", answers:["Aankomst","Opstanding","Vuur","Vergeving"], correct:0, explanation:"Advent komt van het Latijnse 'adventus': aankomst. Het is de voorbereiding op Kerstmis."},
  {id:5, category:"Feesten", difficulty:"medium", question:"Welk feest vieren christenen vijftig dagen na Pasen?", answers:["Hemelvaart","Pinksteren","Allerheiligen","Driekoningen"], correct:1, explanation:"Op Pinksteren vieren christenen de komst van de Heilige Geest."},
  {id:6, category:"Wereldgodsdiensten", difficulty:"easy", question:"Wat is de heilige plaats van de moslims in Mekka?", answers:["De Klaagmuur","De Kaaba","De Gouden Tempel","Het Vaticaan"], correct:1, explanation:"De Kaaba in Mekka is het centrum van de bedevaart (hadj)."},
  {id:7, category:"Wereldgodsdiensten", difficulty:"medium", question:"Hoe heet het heilige boek van de islam?", answers:["Tora","Koran","Veda","Tripitaka"], correct:1, explanation:"De Koran is het heilige boek van de islam."},
  {id:8, category:"Tien geboden", difficulty:"easy", question:"Aan wie gaf God volgens de Bijbel de tien geboden?", answers:["Mozes","Petrus","Jozef","Elia"], correct:0, explanation:"Mozes ontving de tien geboden op de berg Sinaï."},
  {id:9, category:"Parabels", difficulty:"medium", question:"Welke parabel vertelt over een zoon die zijn erfenis verspilt?", answers:["De goede herder","De verloren zoon","De barmhartige Samaritaan","De zaaier"], correct:1, explanation:"In de parabel van de verloren zoon wordt de vader vergevend ontvangen."},
  {id:10, category:"Symbolen", difficulty:"easy", question:"Welk symbool hoort bij het jodendom?", answers:["Ster van David","Wiel van de dharma","Om-teken","Halve maan"], correct:0, explanation:"De zespuntige Ster van David is een bekend joods symbool."}
];

let questions = BUILTIN_QUESTIONS.slice();

async function loadQuestions() {
  try {
    const res = await fetch("questionsdata.json");
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data) && data.length) questions = data;
  } catch (e) {
  }
}
