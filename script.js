//когда страница прогрузилась
document.addEventListener("DOMContentLoaded", function(e) {
	var curlvl = 1; //текущий уровень
	var countErrors = 3; // макс. количество ошибок
	var curCountErrors = 0; // количество ошибок
	var score = 0; //кол-во очков стартовое
	var coef = 10; //коэффициент на который прибавляются очки (зависит от уровня) 
	var time = 12; //изначальное время
	var mintime = 5; //минимальное время на прохождение уровня
	var progressbarinner = null; //чтобы обновлять таймер
	var images = ['bear','camel','cat','cow','crocodile','dog','duck','elephant',
	'frog','hen','horse','lama','monkey','penguin','rabbit']; //возможные картинки
	var gameover = false; //закончили игру или ещё нет
	var expected = null; //ожидаемое изображение
	var arr = []; //массив названий изображений
	var level = "easy"; // уровень сложности
	var curCount = 0; // сколько раз угадал на харде
	var alreadyChoises = [];
	
	//рандомное число в диапазоне от [min, max)
	function getRandInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min;
	}

	// очистка рейтинга
	const clearScore = document.getElementById('score__clear');
	clearScore.addEventListener('click', () => {
		localStorage.clear();
		var table = document.getElementById("tableRating"); 
		table.innerHTML = null;
		var name = document.getElementById("fname").value;
		let obj = {
			easy: 0,
			hard: 0
		};
		localStorage.setItem(name, JSON.stringify(obj));
	});
	
	//добавляем к названию соответствующие префиксы и постфиксы
	function addImage(name,state){
		var ans = "";
		switch(state){
			case 0:{
				ans = "images/" + name + ".png";
				break;
			}
			case 1:{
				ans = "images/" + name + "_pix.png";
				break;
			}
			case 2:{
				ans = "rotate_left/" + name + ".png";
				break;
			}
			case 3:{
				ans = "rotate_left/" + name + "_pix.png";
				break;
			}
			case 4:{
				ans = "rotate_right/" + name + ".png";
				break;
			}
			case 5:{
				ans = "rotate_right/" + name + "_pix.png";
				break;
			}
		}
		return ans;
	}
	
	//формирование картинок для отгадывания
	function getImages(){
		var index = getRandInt(0,images.length);
		var name = images[index]; //ожидаемое изображение
		expected = name;
		var choice = Array.from(Array(images.length).keys()); //все возможные индексы
		delete choice[index]; //кроме index
		var ians = getRandInt(0,2); //рандомное положение правильного ответа в таблице
		var jans = getRandInt(0,4);
		 //0 - правильное, 1 - зашумленное, 2,3 - повернутое налево, 4,5 - направо
		var state = getRandInt(0,6);
		var ans = addImage(name,state);
		//массив с картинками (их местоположениями относительно html файла)
		arr = [];
		for(let i = 0; i < 2; i++){
			arr.push([0,0,0]);
			for(let j = 0; j < 4; j++){
				if(i == ians && j == jans){
					arr[i][j] = ans; //правильное изображение
				}
				else{
					let st = getRandInt(0,6);
					let idx = getRandInt(0,choice.length);
					delete choice[idx]; //чтобы два раза не выбрать одну и ту же
					arr[i][j] = addImage(images[idx],st);
				}
			}
		}
	}
	
	//обновление изображений в блоках
	function resetImages(){
		var expect = document.getElementById("expected");
		expect.innerHTML = "<img class='img2' src='images/" + expected + ".png'>";
		for(let i = 0; i < 2; i++){
			for(let j = 0; j < 4; j++){
				let block = document.getElementById("block" + i + "" + j);
				block.innerHTML = "<img class='img2' src='" + arr[i][j] + "'>";
			}
		}
	}
	
	//обновление счета
	function updateScore(){
		let key = document.getElementById("fname").value;
		if(localStorage.hasOwnProperty(key)){
			var obj = JSON.parse(localStorage.getItem(key));
			var scores_obj = level == "easy" ? obj.easy : obj.hard; 
			if(scores_obj < score){
				if (level == "easy") {
					obj.easy = score
				}
				else {
					obj.hard = score
				}
				localStorage.setItem(key,JSON.stringify(obj));
			}
		}
	}

	function doneLevel() {
		var popup = document.getElementById("popup-win");
		document.getElementById("popup-text-win").innerHTML = "Вы выиграли!"
														+ "<br>Ваш счет: " + score;
		if (level == "hard") {
			document.getElementById('level2').remove();
		}
		popup.style.display = "block";
		gameover = true;
		progressbarinner.style.animationPlayState = 'paused';
		updateScore();
	}
	
	//если ответили правильно
	function nextLvl(){
																						// FIXME-----------------
		if (curlvl == 11) {
			doneLevel();
			updateScore();
			return
		}	
		curlvl++;
		score += curlvl * coef * 0.25; //увеличиваем счет
		score = Math.floor(score);
		//обновляем в div счет и уровень
		var textLvl = document.getElementById("textLvl");
		var scoreLvl = document.getElementById("textScore");
		textLvl.innerHTML = "Раунд: " + curlvl;
		scoreLvl.innerHTML = "Счет: " + score;
		coef++; //повышаем коэффициент
		//задаем новый таймер
		if(time > mintime){
			time -= 1;
		}
		createProgressbar('progressbar1', time.toString() + "s", function(e){
			gameOver();
		});
		getImages(); //получаем массив названий картинок
		resetImages(); //устанавливаем их
		updateScore(); //обновляем
		curCount = 0;
		alreadyChoises = [];
	}
	
	//начало игры
	function startGame(){
		if (level == "easy") {
			const hider = document.querySelector('.pre-start');
			hider.classList.add("hider");
			setTimeout(() => {
				hider.classList.remove("hider");
			}, 3000);
			countErrors = 3;
		}
		else if (level == "hard") {
			const hider = document.querySelector('.pre-start-hard');
			hider.classList.add("hider");
			setTimeout(() => {
				hider.classList.remove("hider");
			}, 3000);
			countErrors = 2;
		}

		document.getElementById("menu").style.display = "none";
		document.getElementById("game").style.display = "block";
		document.getElementById("main-game").style.display = "block";
	    curlvl = 1;
		curCountErrors = 0;
	    score = 0;
	    coef = 10;
	    time = 12;
		gameover = false;
	    var textLvl = document.getElementById("textLvl");
		var scoreLvl = document.getElementById("textScore");
		var textTime = document.getElementById("textTime");
		var textErrors = document.getElementById("countErrors");
		textTime.innerHTML = "Осталось времени:";
		textLvl.innerHTML = "Раунд: " + curlvl;
		scoreLvl.innerHTML = "Счет: " + score;
		textErrors.innerHTML = "Ошибки: " + countErrors;
		createProgressbar('progressbar1', time.toString() + "s", function(e){
			gameOver();
		});
		getImages(); //получаем массив названий картинок
		resetImages(); //устанавливаем их
	}
	
	//конец игры
	function gameOver(){
		var popup = document.getElementById("popup-lose");
		document.getElementById("popup-text").innerHTML = "Вы проиграли!"
														+ "<br>Пройденных раундов: " + (curlvl - 1)
														+ "<br>Ваш счет: " + score;
		popup.style.display = "block";
		gameover = true;
		progressbarinner.style.animationPlayState = 'paused';
		updateScore();
		curCount = 0;
		alreadyChoises = [];
	}

	// ошибка
	function error(){
		var textErrors = document.getElementById("countErrors");
		textErrors.innerHTML = "Ошибки: " + (countErrors - curCountErrors);
	}

	// изменение фона
	const btnThemeRed = document.querySelector('.theme__btn--red');
	const btnThemeBlue = document.querySelector('.theme__btn--blue');
	const btnThemeWhite = document.querySelector('.theme__btn--white');

	btnThemeRed.addEventListener('click', () => {
		changeTheme("rgb(238, 156, 156)");
	
	});
	btnThemeBlue.addEventListener('click', () => {
		changeTheme("rgb(115, 160, 243)");
	
	});
	btnThemeWhite.addEventListener('click', () => {
		changeTheme("rgb(255, 255, 255)");
	
	});

	function changeTheme(color) {
		var mainDivs = document.getElementsByClassName("main");
		for (var i = 0; i < mainDivs.length; i++) {
			mainDivs[i].style.backgroundColor = color;
		}

		var blocks = document.getElementsByClassName("block");
		for (var i = 0; i < blocks.length; i++) {
			blocks[i].style.backgroundColor = color;
		}

		var pref = document.getElementsByClassName("preference");
		for (var i = 0; i < pref.length; i++) {
			pref[i].style.backgroundColor = color;
		}

		var panel = document.getElementsByClassName("panel");
		for (var i = 0; i < panel.length; i++) {
			panel[i].style.backgroundColor = color;
		}
	}
	
	//вход
	var join = document.getElementById("join");
	join.addEventListener("click",function(e){
		//проверка имени
		var name = document.getElementById("fname").value;
		if(name.length == 0){
			alert("Вы не ввели имя!");
		}
		else{
			//добавляем в локальное хранилище имя если его ещё нет
			if(!localStorage.hasOwnProperty(name)){
				let obj = {
					easy: 0,
					hard: 0
				};
				localStorage.setItem(name, JSON.stringify(obj));
			}
			//закрываем окно входа и открываем главное меню
			document.getElementById("autoriz").style.display = "none";
			document.getElementById("menu").style.display = "block";
			document.getElementById("name").innerHTML = "Ваше имя: " + document.getElementById("fname").value;;
		}
	});
	
	//реализация полосы прогресса
	function createProgressbar(id, duration, callback) {
		var progressbar = document.getElementById(id);
		progressbar.className = 'progressbar';
		var inner = document.createElement('div');
		inner.className = 'inner';
		inner.style.animationDuration = duration;
		if (typeof(callback) === 'function') {
			inner.addEventListener('animationend', callback);
		}
		if(progressbarinner == null){
			progressbar.appendChild(inner); //динамически добавляем элемент
		}
		else{
			progressbar.replaceChild(inner,progressbarinner);
		}
		progressbarinner = inner;
		progressbarinner.style.animationPlayState = 'running';
	}
	
	//начало игры - easy
	var start_easy = document.getElementById("start-easy");
	start_easy.addEventListener("click",function(e){
		level = "easy";
		startGame();
	});

	//начало игры - hard
	var start_hard = document.getElementById("start-hard");
	start_hard.addEventListener("click",function(e){
		level = "hard";
		curCount = 0;
		alreadyChoises = [];
		startGame();
	});

	//переход от легкого к сложному
	var switch_hard = document.getElementById("level2");
	switch_hard.addEventListener("click",function(e){
		document.getElementById("popup-win").style.display = "none";
		level = "hard";
		curCount = 0;
		alreadyChoises = [];
		startGame();
	});
	
	//перезапуск игры
	var restart = document.getElementById("restart");
	restart.addEventListener("click",function(e){
		startGame();
	});

	//перезапуск игры из попапа
	var restart = document.getElementById("restart2");
	restart.addEventListener("click",function(e){
		document.getElementById("popup-lose").style.display = "none";
		startGame();
	});

	// количество верных картинок в массива за раунд
	function getCountExpected() {
		var count_expected = 0;

		for(var x = 0; x < arr.length; x++){
			for(var j = 0; j < arr[x].length; j++) {
				if (arr[x][j].indexOf(expected) != -1){
					count_expected += 1;
				}
			}
		}

		return count_expected;
	}

	const textAttemptFail = document.querySelector('.text__attempt--fail');
	const textAttemptRight = document.querySelector('.text__attempt--right');
	const textAttemptOver= document.querySelector('.text__attempt--over');

	let animationAttempt = function (textForm, className) {
		textForm.classList.add(className);
		setTimeout(() => {
			textForm.classList.remove(className);
		}, 700);
	};
	
	//привязка к блокам событий наведения на них мыши и двойного клика
	for(let i = 0; i < 2; i++){
		for(let j = 0; j < 4; j++){
			let block = document.getElementById("block" + i + "" + j);
			block.addEventListener("mouseenter",function(e){
				block.style.boxShadow = "0 0 0 2px black";
			});
			block.addEventListener("mouseleave",function(e){
				block.style.boxShadow = "";
			});			
			block.addEventListener("dblclick",function(e){
				//если игра ещё идет
				if(gameover == false){
					if (level == "easy"){
						//если выбрали правильную картинку (название входит в то, которое находится в массиве)
						if(arr[i][j].indexOf(expected) != -1){
							// block.style.boxShadow = "0 0 0 6px green";
							animationAttempt(textAttemptRight, "right");
							setTimeout(nextLvl, 500);
						}
						else if (curCountErrors < countErrors){
							curCountErrors += 1;
							// block.style.boxShadow = "0 0 0 6px yellow";
							animationAttempt(textAttemptFail, "fail");
							setTimeout(error, 250);
						}
						else{
							// block.style.boxShadow = "0 0 0 6px red";
							animationAttempt(textAttemptOver, "over");
							// curCountErrors += 1;
							error();
							setTimeout(gameOver, 500);
						}
					}

					if (level == "hard") {
						//если выбрали правильную картинку (название входит в то, которое находится в массиве)
						var count_expected = getCountExpected();
						var index_excepted = arr[i][j].indexOf(expected);

						if (index_excepted != -1 && alreadyChoises.indexOf(`${i}${j}`) == -1) {
							alreadyChoises.push(`${i}${j}`);
							// block.style.boxShadow = "0 0 0 6px green";
							animationAttempt(textAttemptRight, "right");
							curCount += 1;
						}
						else if (curCountErrors < countErrors - 1){
							curCountErrors += 1;
							// block.style.boxShadow = "0 0 0 6px yellow";
							animationAttempt(textAttemptFail, "fail");
							setTimeout(error, 250);
						}
						else{
							// block.style.boxShadow = "0 0 0 6px red";
							animationAttempt(textAttemptOver, "over");
							// curCountErrors += 1;
							error();
							setTimeout(gameOver, 500);
							return
						}

						if (count_expected == curCount){
							block.style.boxShadow = "0 0 0 6px green";
							setTimeout(nextLvl, 500);
						}
						
					}
				}
			});
		}
	}
	
	//переход в рейтинг
	var rating = document.getElementById("rating");
	rating.addEventListener("click",function(e){
		//берем первые три наилучших результата из хранилища и отображаем их
		let keys = Object.keys(localStorage);
		let tuple = [];
		for(let name of keys) {
			let obj = JSON.parse(localStorage.getItem(name));
			tuple.push([name,obj]);
		}
		//упорядочиваем массив по убыванию счета
		tuple.sort(function(a,b){
			a = a[1].easy + a[1].hard;
			b = b[1].easy + b[1].hard;
			return b - a;
		});
		var table = document.getElementById("tableRating");
		table.innerHTML = "";
		for(var i = 0; i < tuple.length && i < 10; i++){
			let s = tuple[i][0] + " - " + (tuple[i][1].easy + tuple[i][1].hard) + " очков";
			table.innerHTML += "<div class='text1'>" + s + "</div>";
		}
		document.getElementById("menu").style.display = "none";
		document.getElementById("ratings").style.display = "block";
	});
	
	//возврат в меню
	var ret = document.getElementById("return");
	ret.addEventListener("click",function(e){
		document.getElementById("ratings").style.display = "none";
		document.getElementById("menu").style.display = "block";
	});
	
	//возврат из игры в меню
	var ret2 = document.getElementById("return2");
	ret2.addEventListener("click",function(e){
		if(progressbarinner != null){
			progressbarinner.style.animationPlayState = 'paused';
			//обновление рейтинга
			updateScore();
		}
		document.getElementById("game").style.display = "none";
		document.getElementById("menu").style.display = "block";
		document.getElementById("main-game").style.display = "none";
	});

	//возврат из попапа игры в меню lose
	var ret3 = document.getElementById("return3");
	ret3.addEventListener("click",function(e){
		if(progressbarinner != null){
			progressbarinner.style.animationPlayState = 'paused';
			//обновление рейтинга
			updateScore();
		}
		document.getElementById("popup-lose").style.display = "none";
		document.getElementById("game").style.display = "none";
		document.getElementById("menu").style.display = "block";
		document.getElementById("main-game").style.display = "none";
	});

	//возврат из попапа игры в меню win
	var ret4 = document.getElementById("return4");
	ret4.addEventListener("click",function(e){
		if(progressbarinner != null){
			progressbarinner.style.animationPlayState = 'paused';
			//обновление рейтинга
			updateScore();
		}
		document.getElementById("popup-win").style.display = "none";
		document.getElementById("game").style.display = "none";
		document.getElementById("menu").style.display = "block";
		document.getElementById("main-game").style.display = "none";
	});
	
	//выход
	var exit = document.getElementById("exit");
	exit.addEventListener("click",function(e){
		document.getElementById("fname").value = "";
		document.getElementById("menu").style.display = "none";
		document.getElementById("autoriz").style.display = "block";
	});
});