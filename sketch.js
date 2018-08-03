w = 1920;
h = 1080;
let enemies =[]; 
let score = 0;	
function setup() {
	createCanvas(w, h);
	background(0);
	for (enemy of enemies){
		enemy.setColor(random(0,255),random(0,255),random(0,255));
	}
}

class bullet{
	constructor(x,y,w,h,o,att = 20){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.r = 0;
		this.g = 255;
		this.b = 0;
		this.speed = 25;
		this.orientation = o;
		this.speed *= this.orientation;
		this.att = att;
	}
	draw(){
		fill(this.r,this.g,this.b);
		if (this.orientation > 0)
			rect(this.x,this.y-this.h/2,this.w,this.h);
		else if (this.orientation < 0)
			rect(this.x-this.w,this.y-this.h/2,this.w,this.h);
		this.x+=this.speed;
	}

}
class healthBar{
	constructor(ratio,x,y,w,h){
		this.ratio = ratio;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h
	}
	draw(){

		fill(255); //Background rectangle color
		stroke(255);
		strokeWeight(5);
		rect(this.x,this.y,this.w,this.h);
		fill(255,0,0); //Red HP bar
		noStroke();
		rect(this.x,this.y,this.w *this.ratio,this.h);
	}
}
class spaceShip{
	constructor(x = w,y = h / 2,w = 50,h = 75,o =-1, hp = 100, action=1){
		//Player ship elements
		this.x = x; //x pos of ship
		this.y = y; //y pos of ship
		this.w = w; //width of ship
		this.h = h; //height of ship
		this.r = 255; //Red val
		this.g = 0; //Green val
		this.b = 0; //Blue val
		this.controllerSpeed = 8; //Speed of player's ship
		this.orientation = o; //1 = facing right, -1 = facing left
		this.numBullets = 2;
		this.bulletSpeed = 20;
		this.delay = 90;
		this.c = 0; //counter of time after bullet fired
		this.hp = hp;
		this.fullHp = hp;
		this.bullets = [];
		this.flash = 0; //Variable needed for ship to flash and fade back into color when it's hit
		this.score = 1;
		this.oYPos = y; //holds original
		this.hpBar = 'undefined';
		//Enemy elements
		this.maxFlash = 60 * 0.5;
		this.xSpeed = 4;
		this.ySpeed = 4;
		this.bound = 200;
		this.att = 20;
		this.action = action;
	}
	setHp(hp){
		this.hp = hp;
		this.fullHp = hp;
	}
	setColor(r,g,b){
		this.r = r;
		this.g = g;
		this.b = b;
	}
	/**
	 * Cases for not collision:
	 * left side of bullet is more right than rightmost point in spaceship
	 * leftside of spaceship is more right than leftside of bullet
	 * bullet is above spaceship
	 * bullet is below spaceship
	 */
	isHit(bullet){
		var bTop = bullet.y - bullet.h/2;
		var bBottom = bullet.y + bullet.h/2;
		var bRight;
		var bLeft;
		var spTop = this.y - this.h/2;
		var spBottom = this.y + this.h/2;
		var spRight;
		var spLeft;
		if (bullet.orientation == 1){
			bRight = bullet.x + bullet.w;
			bLeft = bullet.x;
		}else if (bullet.orientation == -1){
			bRight = bullet.x;
			bLeft = bullet.x - bullet.w;
				}
		if (this.orientation == 1){
			spRight = this.x + this.w;
			spLeft = this.x;
		}else if (this.orientation == -1){
			spRight = this.x
			spLeft = this.x - this.w;
		}
		if (bRight < spLeft){
			return false;
		}
		if (bLeft > spRight){
			return false;
		}
		if (bBottom < spTop){
			return false;
		}
		if (bTop > spBottom){
			return false;
		}
		return true;
	}

	//Enemy movement patterns:
	//#1:
	//moves straight towards player
	straightThrough(){
		this.x -= this.xSpeed;
	}
	//#2:
	//moves through stage with zig zag pattern towards player
	zigZag(){	
		this.x -= this.xSpeed;
		if (this.y < this.oYPos - this.bound || this.y > this.oYPos + this.bound || this.y - this.h/2 < 0 || this.y + this.h /2 > h){
			this.ySpeed *= -1;
		}
		console.log(this.oYPos);
		console.log(this.y);
		this.y += this.ySpeed;
	}
	
	
	moveIt(){
		
		if (this.action == 1)
			this.straightThrough();
		else if (this.action == 2)
			this.zigZag();
	}
	draw(){	
		if (this.flash >= 0){
			this.flash--;
		}
		if (this.orientation == 1)
			this.hpBar = new healthBar(this.hp / this.fullHp,150,125,300,37);
		else if (this.orientation == -1)
			this.hpBar = new healthBar(this.hp / this.fullHp,this.x,this.y-50 - this.h/2,100,12);
		this.hpBar.draw();
		this.topLeftEdge = this.y - this.h / 2;
		this.bottomLeftEdge = this.y + this.h / 2;
		fill(this.r,this.g,this.b);
		if (this.flash > 0){
			fill(map(this.flash,this.maxFlash,0,255,this.r),map(this.flash,this.maxFlash,0,0,this.g),map(this.flash,this.maxFlash,0,0,this.b));
		}
		this.wingLength = this.w/4 * this.orientation;
		this.wingSlant = this.h/8;
		quad(this.x,this.topLeftEdge,this.x+this.wingLength,this.topLeftEdge+this.wingSlant,this.x+this.wingLength,this.bottomLeftEdge-this.wingSlant,this.x,this.bottomLeftEdge);
		fill(this.b,this.g,this.r);
		if (this.flash > 0){
			fill(map(this.flash,this.maxFlash,0,255,this.b),map(this.flash,this.maxFlash,0,0,this.g),map(this.flash,this.maxFlash,0,0,this.r));
		}
		triangle(this.x,this.y-this.h/3,this.x,this.y+this.h/3,this.x+this.w*this.orientation,this.y);	
		if (this.bullets.length > 0){
			for (var i = 0; i < this.bullets.length; i++){
				this.bullets[i].draw();
				if (this.bullets[i].x > w || this.bullets[i].x < 0){
					this.bullets.splice(i,1);
				}
			}
		}
	}
	move(){
		if (keyIsDown(UP_ARROW) && this.y > this.h/2){
			this.y-=this.controllerSpeed;
		}else if(keyIsDown(DOWN_ARROW) && this.y < (h - this.h/2)){
			this.y+=this.controllerSpeed;
		
		}
	}
	spacePressed(){
		if (key == ' ')
			this.shoot();
	}
	autoShoot(){
		this.c++;
		if (this.c > this.delay){
			this.shoot();
			this.c = 0;
		}

	}
	shoot(){
		if (this.bullets.length < this.numBullets){
			this.bullets.push(new bullet(this.x+this.w*this.orientation,this.y,this.w/4,this.h/20,this.orientation,this.att));
			this.bullets[this.bullets.length-1].speed = this.bulletSpeed * this.orientation;
		}
	}
	takeDamage(ship, bullet){
		this.flash = this.maxFlash;
		var damage = bullet.att;
	//	console.log(damage);
		this.hp -= damage;
		if(this.orientation == 1 && this.hp <= 0){
			this.h = 0;
			this.w = 0;
		}else if (this.hp <= 0){
			for (var i = 0; i < enemies.length; i++)
				if (enemies[i].x == this.x && enemies[i].y == this.y){
					enemies.splice(i,1);
					score += this.score;
				}
		}
}
}
let ship = new spaceShip(100,h/2,100,150,1,300);
ship.att = 50;
ship.bulletSpeed = 50;
let timePassed = 0;
function draw() {
	background(0);
	if (timePassed < 60 * 3){
		displayTitle();
	}else if (ship.hp > 0){
		ship.move();
		ship.draw();
		//Enemies take Damage from you
		renderEnemy();
		damageToEnemies();
		damageToYou();
		cleanUp();
		fill(255);
		text("score: " + score, w-300, 100);
		text("Health: " + parseInt(ship.hp/3) + "%" , 200, 100);
	}else{
		textSize(64);
		fill (255);
		text("GAME OVER", w/2-300, h/2);
		textSize(32);
		text("score: " + score, w/2 - 300, h/2 + 200);
	}
	timePassed++;
}
function cleanUp(){
	let len = enemies.length;
	for (var i = 0; i < len; i++){
		if (enemies[i].x < 0){
			score-= enemies[i].score;
			enemies.splice(i,1);
			i--;
			len--;
		}
	}
}
function displayTitle(){
	if (typeof displayTitle.size == 'undefined'){
		displayTitle.size = 0;
	}
	textSize(displayTitle.size);
	fill(255);
	text("Kill all your damn enemies today!", w / 2 - 300, h / 2);
	displayTitle.size = (displayTitle.size>=32)?32:displayTitle.size + .5;
}
var render = {duration:60*5, counter: 60 * 5}
function renderEnemy(){
	if ( render.counter == render.duration){
		enemyToRender = Math.floor(Math.random() * 100 + 1); // allows choice between 4 defined enemies:
		/**
		 * Enemy types:
		 * 1: Slow and tanky
		 * 2: fast and weak
		 * 3: Powerful and long
		 * 4: Normal enemy
		 */
		enemy = 'undefined';
		if (enemyToRender > 0 && enemyToRender <= 10){
			enemy = new spaceShip(w,random(150,h-150),100,300,-1,100,parseInt(Math.floor(Math.random() * 2 + 1)));
			enemy.Speed *= 1/2;
			enemy.setHp(enemy.hp * 5);
			enemy.score = 10;
		}else if (enemyToRender > 10 && enemyToRender <= 40){
			enemy = new spaceShip(w,random(150,h-150),100,150,-1,100,parseInt(Math.floor(Math.random() * 2 + 1)));
			enemy.xSpeed *= 2;
			enemy.setHp(enemy.hp * 0.25);
			enemy.h *= 3/4;
			enemy.w *= 3/4;
			enemy.delay *= 1/2;
			enemy.att *= 1/4;
			enemy.score = 0.5;
		}else if (enemyToRender > 40 && enemyToRender <=60){
			enemy = new spaceShip(w,random(150,h-150),350,150,-1,100,parseInt(Math.floor(Math.random() * 2 + 1)));
			enemy.att *= 5;
			enemy.bulletSpeed *= 1.5;
			enemy.setHp(enemy.hp * 2);
			enemy.score = 5;
		}else if (enemyToRender > 60)
			enemy = new spaceShip(w,random(150,h-150),100,150,-1,100,parseInt(Math.floor(Math.random() * 2 + 1)));
		enemies.push(enemy);
		enemies[enemies.length-1].setColor(random(50,255),random(50,255),random(50,255));
		render.counter = 0;
		if (render.duration >= 60 * 1.7){
			render.duration -= 45;
		}
	}
	render.counter++;

}
function damageToYou(){
	for (var i = 0; i < enemies.length; i++ ){
		for (var j = 0; j < enemies[i].bullets.length;j++){
		if (ship.isHit(enemies[i].bullets[j])){
				ship.takeDamage(enemies[i],enemies[i].bullets[j]);
				enemies[i].bullets.splice(j,1);
			}
		}
	}
}
function damageToEnemies(){
	var beyondReach = false; //Solves bug that causes game to crash
	for (var i = 0; i < enemies.length; i++){
		if (beyondReach)
			break;
		enemies[i].draw();
		enemies[i].moveIt();
		enemies[i].autoShoot();
		for (var j = 0; j < ship.bullets.length; j++){
			if (i > enemies.length -1){
				beyondReach = true;
				break;
			}
			if (enemies[i].isHit(ship.bullets[j])){
				enemies[i].takeDamage(ship,ship.bullets[j]);
				ship.bullets.splice(j,1);
				j--;
			}
		}
	}	
}
function keyTyped(){
	ship.spacePressed();
}
