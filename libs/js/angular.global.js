var globalapp = angular.module( 'globalapp', [] );

globalapp.config(["$httpProvider", function ($httpProvider) {
    $httpProvider.interceptors.push(function ($rootScope, $q) {
        return {
            'request': function (config) {
//              $('.sk-spinner-three-bounce.sk-spinner, .main-mask').removeClass('item-hidden');
//              dk.lastRequest = config;
				if( $( '#loading_img' )[0] && $( '#loading_img' ).is(':hidden') ){
					$( '#loading_img' ).show();
				}else{
//					$( 'body' ).append( '<div class="mask"></div>' );
					$( 'body' ).append( '<img id="loading_img" src="libs/img/loading.gif"/>' );
				}
                return config || $q.when(config);
            },
            'requestError': function (rejection) {
            	$( '#loading_img' ).remove();
                return rejection;
            },
            'response': function (response) {
//              $('.sk-spinner-three-bounce.sk-spinner, .main-mask').addClass('item-hidden');

                return response || $q.when(response);
            },
            'responseError': function (response) {
//              alert(response.status + ' - ' + response.statusText + '<br/>请求路径：<br/>' + response.config.url, '请求错误');
//              $('.sk-spinner-three-bounce.sk-spinner, .main-mask').addClass('item-hidden');
				$( '#loading_img' ).remove();
                return $q.reject(response);
            }
        };
    });
}]);
