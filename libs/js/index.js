var myApp = angular.module('myApp', ['ionic', 'globalapp']);

myApp.controller( 'ctrl', function( $scope, $http, $compile ) {
	
	var global_prop = {
		current_play_list: {},	//当前播放列表
		current_play_list_index: 0,	//当前播放列表的歌曲序号 
	}
	
	//目前的音乐类型
	var music_type = 26;
	
	$scope.onPlay_pic = 'libs/img/disk.png';
	
	show_songs();
	
	//根据不同类型，加载歌曲列表
	function show_songs(){
		$http({
			url: global.musicURL,
			async: false,
			params: {
				showapi_sign: global.musicKey,
				showapi_appid: global.musicID,
				topid: music_type
			}
		}).success( function( resp ){
//			console.log( JSON.stringify( resp.showapi_res_body.pagebean.songlist ) )
			$scope.songs = resp.showapi_res_body.pagebean.songlist;
			global_prop.current_play_list = $scope.songs;
			$( '.mask' ).remove();
			$( '#loading_img' ).remove();
		});
	}

	//打开App显示上次最后播放的歌曲
	var obj = JSON.parse( window.localStorage.getItem( 'MusicStudio' ) );
	if( obj != null ){
		show_lastSong( obj );
	}
	function show_lastSong( obj ){
		$( 'audio' ).remove();
		if( obj.m4a ){
			console.log( '存在m4a' )
			$( 'body' ).append( '<audio src="' + obj.m4a + '" autoplay="autoplay" id="song"></audio>' );
		}else{
			$( 'body' ).append( '<audio src="' + obj.downUrl + '" autoplay="autoplay" id="song"></audio>' );
		}
		$( '#song' )[0].pause();
		$( '#song' )[0].currentTime =  window.localStorage.getItem( 'MusicTime' );
		$( '.footer .player_ctrl input' ).val( 0 ).next().css( 'width', '0%' );
//		var percent = parseInt( $( '#song' )[0].currentTime / $( '#song' )[0].duration * 100 );
//		$( '.footer .player_ctrl input' ).val( percent ).next().css( 'width', percent*0.96 + '%' );
		//将信息写入音乐控件
		$scope.onPlay_pic = obj.albumpic_small;
		$scope.onPlay_song = obj.songname;
		$scope.onPlay_singer = obj.singername;
	}

//	-------------------------------------调试需要,直接请求本地的数据    -------------------------------------      
//	 function show_songs(){
//	 	$http({
//	 		url: 'zhangxueyou.txt',
//	 		async: false
//	 	}).success( function( resp ){
//	 		$scope.songs = resp;
//	 		global_prop.current_play_list = $scope.songs;
//	 		$( '.mask' ).remove();
//	 		$( '#loading_img' ).remove();
//	 	});
//	 }
//	-------------------------------------调试需要,直接请求本地的数据    ------------------------------------- 
	
	//根据模糊歌名，搜索歌曲列表
	function search_songs( keyword ){
		$http({
			url: global.searchURL,
			async: false,
			params: {
				showapi_sign: global.musicKey,
				showapi_appid: global.musicID,
				keyword: keyword,
				page: 1
				
			}
		}).success( function( resp ){
			console.log( '根据模糊歌名，搜索歌曲列表' );
			$scope.songs = [];
			$scope.songs = resp.showapi_res_body.pagebean.contentlist;
			global_prop.current_play_list = $scope.songs;
			$( '.mask' ).remove();
			$( '#loading_img' ).remove();
		});
	}
	
//	下拉刷新
	$scope.doRefresh = downRefresh;
	function downRefresh(){
		console.log( '下拉刷新' )
//		show_songs();
		$scope.$broadcast('scroll.refreshComplete');
	};
//	window.localStorage.clear( 'PlayList' );
	//点击歌曲播放
	$scope.play_song = function( obj, index ){
		
		//记录在本地存储
		window.localStorage.setItem( 'MusicStudio', JSON.stringify( obj ) );
		//每次点击播放歌曲，将歌曲保存到播放列表
		if( window.localStorage.getItem( 'PlayList' ) == null ){
			var PlayList = [];
//			obj.PlayListIndex = '01';
			delete obj.$$hashKey;
			PlayList.push( obj );
			window.localStorage.setItem( 'PlayList', JSON.stringify( PlayList ) );
		}else{
			var PlayList = window.eval( window.localStorage.getItem( 'PlayList' ) );
//			obj.PlayListIndex = oneToTwo( PlayList.length + 1 );
			var sameSongFlag = 0;	//标记将要存放的歌曲，列表里面是否存在
			for( var key in PlayList ){
				if( PlayList[key].songid === obj.songid ){
					console.log( '播放列表:有相同歌曲' ); sameSongFlag = 1;
				}
			}
			if( !sameSongFlag ){
				delete obj.$$hashKey;
				PlayList.push( obj );
			}
			window.localStorage.setItem( 'PlayList', JSON.stringify( PlayList ) );
		}
		$scope.songsList = window.eval( window.localStorage.getItem( 'PlayList' ) );
		
		//记录播放歌曲的序号
		global_prop.current_play_list_index = index;
		
		$( 'ion-list a' ).removeClass( 'actived' );
		$( 'ion-list a:eq(' + index + ')' ).addClass( 'actived' );
		console.log( '歌曲时长：' + obj.seconds );
		console.log( '歌曲地址：' + obj.downUrl );
		console.log( obj );
		$( 'audio' ).remove();
		if( obj.m4a ){
			console.log( '存在m4a' )
			$( 'body' ).append( '<audio src="' + obj.m4a + '" autoplay="autoplay" id="song"></audio>' );
		}else{
			$( 'body' ).append( '<audio src="' + obj.downUrl + '" autoplay="autoplay" id="song"></audio>' );
		}
		$scope.play_actived = true;
		$( '#song' )[0].play();
		//显示进度
		$( '.footer .player_ctrl input' ).val( 0 ).next().css( 'width', '0%' );
		window.clearInterval( sing_timer );
		showProgress();
		
		$( '#add_plus' ).remove();
		//播放歌曲添加播放列表动画
		$( 'body' ).append( '<i class="fa fa-plus" id="add_plus"></i>' );
		var a_offset = $( '.m_content a:eq(' + index + ')' ).offset();
		$( '#add_plus' ).offset({ top: a_offset.top+30, left: a_offset.left+26 });
		$( '#add_plus' ).animate({
			top: a_offset.top - 5
		}, 200, function(){
			window.setTimeout( function(){
				$( '#add_plus' ).animate({
					top: $( '.player_img' ).offset().top
				}, 500, function(){
					$( '#add_plus' ).remove();
				});
			}, 60)
		})
		//将信息写入音乐控件
		$scope.onPlay_pic = obj.albumpic_small;
		$scope.onPlay_song = obj.songname;
		$scope.onPlay_singer = obj.singername;
		
		//唱片转动
		$( '.footer img' ).css( '-webkit-animation', 'run 6s linear 0s infinite' );
	};
	//点击切换音乐排行榜
	$scope.musicType = musicTypeObj;
	$scope.defalutType = 'Hot';
	
	window.onload = function(){
		$( '.left_bar label' ).on( 'touchstart', function(){
			console.log( $( this ).text() );
			$scope.songs = [];
			music_type = musicType( $( this ).text() );
			searchOut();
		});
	};
	
	//搜索歌曲
	$scope.search = function(){
		console.log( '搜索' );
		$( '.header_title' ).animate({
			top: -44
		}, 200);
		$( '.search' ).animate({
			top: 0
		}, 200);
		$( '.m_content' ).animate({
			top: 44
		}, 200);
	}
	$( '.search input' ).on( 'keyup', function( evt ){
		if( evt.keyCode === 13 ){
			search_songs( $( '.search input' ).val() );
			$( this ).blur();
		}
	});
	//退出搜索
	$scope.searchOut = searchOut;
	function searchOut(){
		console.log( '退出搜索' );
		$( '.search input' ).val( '' );
		$( '.header_title' ).animate({
			top: 0
		}, 200);
		$( '.search' ).animate({
			top: 44
		}, 200);
		$( '.m_content' ).animate({
			top: 88
		}, 200);
		$scope.songs = [];
		show_songs();
	}
	
	//播放、暂停
	$scope.play = function(){
		$scope.play_actived = !$scope.play_actived;
		if( $scope.play_actived ){
			console.log( '播放控件：播放开始' );
			$( '#song' )[0].play();
			//显示进度
			window.clearInterval( sing_timer );
			showProgress();
			//唱片转动
			$( '.footer img' ).css( '-webkit-animation', 'run 6s linear 0s infinite' );
		}else{
			console.log( '播放控件：播放暂停' );
			$( '#song' )[0].pause();
			$( '.footer img' ).css( '-webkit-animation', '' );
		}
	}
	
	//下一首
	$scope.next_song = next_song;
	function next_song(){
		var songs_list = global_prop.current_play_list;
		var song_index = Number( global_prop.current_play_list_index );
		console.log( song_index );
		if( song_index < songs_list.length - 1  ){
			global_prop.current_play_list_index = song_index + 1;
		}
		console.log( global_prop.current_play_list_index );
		//标识歌曲被选中播放
		$( 'ion-list a' ).removeClass( 'actived' );
		$( 'ion-list a:eq(' + global_prop.current_play_list_index + ')' ).addClass( 'actived' );
		
		$( '.footer .player_ctrl input' ).val( 0 ).next().css( 'width', '0%' );	//进度条归0
		$( 'audio' ).remove();
		var next_song = songs_list[global_prop.current_play_list_index];
		if( next_song.m4a ){
			console.log( '存在m4a' )
			$( 'body' ).append( '<audio src="' + next_song.m4a + '" autoplay="autoplay" id="song"></audio>' );
		}else{
			$( 'body' ).append( '<audio src="' + next_song.downUrl + '" autoplay="autoplay" id="song"></audio>' );
		}
		$( '#song' )[0].play();
		window.clearInterval( sing_timer );
		showProgress();	//显示进度
		
		//记录在本地存储
		window.localStorage.setItem( 'MusicStudio', JSON.stringify( next_song ) );
		
//		//改变音乐控件歌曲内容,将信息写入音乐控件
		$scope.onPlay_pic = next_song.albumpic_small;
		$scope.onPlay_song = next_song.songname;
		$scope.onPlay_singer = next_song.singername;
		
		//唱片转动
		$( '.footer img' ).css( '-webkit-animation', 'run 6s linear 0s infinite' );
	};
	
	//拖放音乐进度
	$( '.footer .player_ctrl input' ).on( 'change', function(){
		window.clearInterval( sing_timer );
		var change_time = $( this ).val() / 100 * $( '#song' )[0].duration;
		$( '#song' )[0].currentTime = change_time;
		showProgress();
	})
	
	//显示进度
	var sing_timer = 0;
	function showProgress(){
		sing_timer = window.setInterval( function(){
			var percent = parseInt( $( '#song' )[0].currentTime / $( '#song' )[0].duration * 100 );
			//总长度
//				var time = parseInt( $( '#song' )[0].duration );
//				var min = two_char( parseInt( time / 60 ) );
//				var second = two_char( time % 60 );
//				$( '.song_time' ).html( min + ':' + second );
			//当前进度
//				var cur_time = parseInt( $( '#song' )[0].currentTime );
//				var cur_min = two_char( parseInt( cur_time / 60 ) );
//				var cur_second = two_char( cur_time % 60 );
//				$( '.current_time' ).html( cur_min + ':' + cur_second );
			//时刻保存播放进度
			window.localStorage.setItem( 'MusicTime', $( '#song' )[0].currentTime );
			//底部播放控件进度监控
			$( '.footer .player_ctrl input' ).val( percent ).next().css( 'width', percent*0.96 + '%' );
			//判断歌曲是否播放完毕
			if( $( '#song' )[0].ended ){
				next_song();
				$compile( $( '.footer' ) )( $scope );
			}
		}, 800);
	}
	
	//点击弹出播放列表
	var listShow = true;
	$( '.footer .list' ).on( 'touchstart', function(){
		listShow = !listShow;
		if( listShow ){
			$( '.playList' ).animate({
				bottom: -260
			}, 200, function(){
				$( this ).hide();
			});
		}else{
			$( '.playList' ).show().animate({
				bottom: 49
			}, 200);
		}
	});
	$scope.songsList = window.eval( window.localStorage.getItem( 'PlayList' ) );
	//删除播放列表中的歌曲
	$scope.deleSong = function( index ){
		console.log( '删除歌曲的序号：' + index );
		$scope.songsList.splice( index, 1 );
		window.localStorage.setItem( 'PlayList', JSON.stringify( $scope.songsList ) );
	}
	//播放列表中的所有歌曲
	$scope.playListSong = function( song, index ){
		console.log( song );
		console.log( index );
		//记录在本地存储
		window.localStorage.setItem( 'MusicStudio', JSON.stringify( obj ) );
		
		global_prop.current_play_list = $scope.songsList;
		//记录播放歌曲的序号
		global_prop.current_play_list_index = index;
		
		$( 'ion-list a' ).removeClass( 'actived' );
		console.log( song );
		$( 'audio' ).remove();
		if( song.m4a ){
			console.log( '存在m4a' )
			$( 'body' ).append( '<audio src="' + song.m4a + '" autoplay="autoplay" id="song"></audio>' );
		}else{
			$( 'body' ).append( '<audio src="' + song.downUrl + '" autoplay="autoplay" id="song"></audio>' );
		}
		$scope.play_actived = true;
		$( '#song' )[0].play();
		//显示进度
		$( '.footer .player_ctrl input' ).val( 0 ).next().css( 'width', '0%' );
		window.clearInterval( sing_timer );
		showProgress();
		
		//将信息写入音乐控件
		$scope.onPlay_pic = song.albumpic_small;
		$scope.onPlay_song = song.songname;
		$scope.onPlay_singer = song.singername;
		
		//唱片转动
		$( '.footer img' ).css( '-webkit-animation', 'run 6s linear 0s infinite' );
	};
	
	//点击右侧栏切换App
//	$scope.appName = appsObj;
////	$scope.appDefalut = 'music';
//	window.onload = function(){
//		$( '.right_bar label' ).on( 'touchstart', function(){
//			console.log( $( this ).text() );
////			$scope.songs = [];
////			music_type = musicType( $( this ).text() );
////			searchOut();
//			$( '.musicApp' ).hide()
//			if( $( this ).text() == '天气预报' ){
//				$( 'ion-side-menu-content .weatherApp' ).show();
//			}
//		});
//	};
	
	//左右侧栏切换方法
	function ContentController($scope, $ionicSideMenuDelegate) {
		$scope.toggleLeft = function() {
			$ionicSideMenuDelegate.toggleLeft();
		};
	}
});
