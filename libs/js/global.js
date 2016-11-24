var global = global || {};
global.musicURL = 'http://route.showapi.com/213-4';
global.musicKey = '3bcdbb9453964d4bab70efcc3d6bda70';
global.musicID = 26919;

var musicTypeObj = [
    { text: "热歌", value: "Hot" },
    { text: "销量", value: "Sales" },
    { text: "内地", value: "Inland" },
    { text: "民谣", value: "Ballad" },
    { text: "摇滚", value: "Rock" },
    { text: "港台", value: "HK&T" },
	{ text: "欧美", value: "E&A" },
    { text: "韩国", value: "Korea" },
    { text: "日本", value: "Japan" }
]

var appsObj = [
    { text: "我的喜爱列表", value: "music" },
    { text: "睡觉听", value: "weather" },
    { text: "坐地铁听", value: "news" }
]

//榜行榜id 3=欧美 5=内地 6=港台 16=韩国 17=日本 18=民谣 19=摇滚 23=销量 26=热歌
function musicType( name ){
	switch( name ){
		case '欧美' : return 3; break;
		case '内地' : return 5; break;
		case '港台' : return 6; break;
		case '韩国' : return 16; break;
		case '日本' : return 17; break;
		case '民谣' : return 18; break;
		case '摇滚' : return 19; break;
		case '销量' : return 23; break;
		case '热歌' : return 26; break;
	}
}

global.searchURL = 'http://route.showapi.com/213-1';

function oneToTwo( num ){
	if( String( num ).length === 1 ){
		return( '0' + String( num ) );
	}else{
		return num;
	}
}