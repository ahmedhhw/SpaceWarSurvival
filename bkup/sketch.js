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
class spaceShip{
	constructor(x = w,y = h / 2,w = 50,h = 75,o =-1, hp = 100, action=1){
		//Player ship elements
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.r;
		this.g;
		this.b;
		this.controllerSpeed = 8;
		this.orientation = o;
		this.numBullets = 2;
		this.delay = 90;
		this.c = 0; //counter of time after bullet fired
		this.hp = hp;
		this.bullets = [];
		//Enemy elements
		this.xSpeed = 4;
		this.ySpeed = 4;
		this.bound = 200;
		this.att = 20;
		this.action = action;
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
	zigZag(){
		this.x -= this.xSpeed;
		if (this.y < h/2 - this.bound || this.y > h/2 + this.bound){
			this.ySpeed *= -1;
		}
		this.y += this.ySpeed;
	}
	straightThrough(){
		this.x -= this.xSpeed;
	}
	moveIt(){
		if (this.action == 1)
			this.straightThrough();
		else if (this.action == 2)
			this.zigZag();
	}
	draw(){	
		this.topLeftEdge = this.y - this.h / 2;
		this.bottomLeftEdge = this.y + this.h / 2;
		fill(255,0,0);
		if (this.orientation == -1)
			fill(this.r,this.g,this.b);
		this.wingLength = this.w/4 * this.orientation;
		this.wingSlant = this.h/8;
		quad(this.x,this.topLeftEdge,this.x+this.wingLength,this.topLeftEdge+this.wingSlant,this.x+this.wingLength,this.bottomLeftEdge-this.wingSlant,this.x,this.bottomLeftEdge);
		fill(0,0,255);
		if (this.orientation == -1)
			fill(this.g,this.r,this.b);
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
		if (this.c == this.delay){
			this.shoot();
			this.c = 0;
		}

	}
	shoot(){
		if (this.bullets.length < this.numBullets)
			this.bullets.push(new bullet(this.x+this.w*this.orientation,this.y,this.w/4,this.h/20,this.orientation,this.att));
	}
	takeDamage(ship, bullet){
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
				}
		}
		if (this.orientation == 1){
			console.log(this.hp);
		}
	}
}
let ship = new spaceShip(100,h/2,100,150,1,300);
ship.att = 200;
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
		text("Health: " + ship.hp/3 + "%" , 200, 100);
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
			enemies.splice(i,1);
			score--;
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
		enemies.push(new spaceShip(w,random(150,h-150),100,150,-1,100,parseInt(random(1,2))));
		enemies[enemies.length-1].setColor(random(0,255),random(0,255),random(0,255));
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
				score += 1;
				j--;
			}
		}
	}	
}
function keyTyped(){
	ship.spacePressed();
}
