// --------------------------------------------------------------------------------------------------------------------------
// variables
// --------------------------------------------------------------------------------------------------------------------------
var apiKey = '7cfc11953bf6bc3f1191b7640343c199'; var playing;
var sports;
var odds;
// --------------------------------------------------------------------------------------------------------------------------
// message
// --------------------------------------------------------------------------------------------------------------------------
$(function() {
	window.addEventListener('message', function(event){
		if(typeof(event.data.manager) != 'undefined') 
		{
			sports();
		}	
		if(typeof(event.data.playing) != 'undefined') 
		{
			playing = jQuery.parseJSON(event.data.playing);
			sports = playing.sports;
			odds = playing.odds;
			$('.betting .playing .toast-body').html('');
			$.each(playing, function(index, value)
			{
				var date = new Date(value.time * 1000);
				var commenceTime = pad((date.getMonth() + 1), 2) + '/' + pad(date.getDate(), 2) + '<br />' + pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2);
				$('.betting .playing .toast-body').append(`
				<div class="bg-dark text-light px-2 py-2 rounded-3 mb-2 match m${value.keym}" 
					data-keym="${value.keym}" data-time="${value.time}"
					data-cham="${value.cham}" data-away="${value.away}" data-home="${value.home}"
					data-odd0="${value.odd0}" data-odd1="${value.odd1}" data-odd2="${value.odd2}"
				>
					<div class="row mb-2">
						<div class="col-12 text-center">
							<strong>${value.cham}</strong>
						</div>
						<div class="col-2">
							<img class="img" src="${value.awayIcon}" />
						</div>
						<div class="col-3 text-end">
							Away<br />
							<strong>${value.away}</strong><br />
							<button class="btn btn-sm btn-outline-success mt-2 bet" type="button" data-bs-dismiss="toast" data-keym="${value.keym}" data-bet="0">${value.odd0}</button>
						</div>
						<div class="col-2 text-center">
							${commenceTime}<br />
							<button class="btn btn-sm btn-outline-success mt-2 bet" type="button" data-bs-dismiss="toast" data-keym="${value.keym}" data-bet="2">${value.odd1}</button>
						</div>
						<div class="col-3">
							Home<br />
							<strong>${value.home}</strong><br />
							<button class="btn btn-sm btn-outline-success mt-2 bet" type="button" data-bs-dismiss="toast" data-keym="${value.keym}" data-bet="1">${value.odd2}</button>
						</div>
						<div class="col-2 text-end">
							<img class="img" src="${value.homeIcon}" />
						</div>
					</div>
				</div>	
				`);
			});	
			$('.betting .playing').toast('show');
		}
	});
	//sports();
	//$('.betting .placeBet').toast('show');
});
// --------------------------------------------------------------------------------------------------------------------------
// call client
// --------------------------------------------------------------------------------------------------------------------------
function callClient(data)
{
	$.post(`https://${GetParentResourceName()}/callClient`, JSON.stringify(data));
}
// --------------------------------------------------------------------------------------------------------------------------
// pad
// --------------------------------------------------------------------------------------------------------------------------
function pad(str, max) {
	str = str.toString(); return str.length < max ? pad('0' + str, max) : str;
}
// --------------------------------------------------------------------------------------------------------------------------
// close
// --------------------------------------------------------------------------------------------------------------------------
$(document).on('click','.betting .manager .close, .betting .playing .close', function() {
	$('.betting .manager').toast('hide'); $('.betting .playing').toast('hide');
	callClient({'event':'iBetting:close'});
});	
// --------------------------------------------------------------------------------------------------------------------------
$(document).on('click','.betting .placeBet .close', function() {
	$('.betting .playing').toast('show');
});	
// --------------------------------------------------------------------------------------------------------------------------
// sports
// --------------------------------------------------------------------------------------------------------------------------
function sports()
{
	$.get(`https://api.the-odds-api.com/v4/sports/?apiKey=${apiKey}`, function(data) {
		// render sports
		$('.manager .sports').html('');
		$.each(data, function(index, value)
		{
			if(value.active === true)
			{
				$('.manager .sports').append(`
					<div class="btn btn-sm btn-dark w-100 mb-2 text-start sport" data-sport="${value.key}">${value.title}</div>
				`);
			}
		});	
		$('.betting .manager').toast('show');
	});
}
// --------------------------------------------------------------------------------------------------------------------------
// odds
// --------------------------------------------------------------------------------------------------------------------------
$(document).on('click','.manager .sports .sport', function() {
	var sport = $(this).data('sport');
	$.get(`https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=eu&dateFormat=unix&oddsFormat=decimal&markets=h2h&apiKey=${apiKey}`, function(data) {
		$('.manager .odds').html('');
		$.each(data, function(index, value)
		{
			var date = new Date(value.commence_time * 1000);
			var commenceTime = pad((date.getMonth() + 1), 2) + '/' + pad(date.getDate(), 2) + ' ' + pad(date.getHours(), 2) + ':' + pad(date.getMinutes(), 2);
			//console.log(value);
			$('.manager .odds').append(`
			<div class="bg-dark text-light px-2 py-2 rounded-3 mb-2 match m${value.id}">
				<div class="row">
					<div class="col-12 rounded-3 mb-2">
						<div class="row">
							<div class="col-4">
								<input class="form-control form-control-sm bg-secondary bg-opacity-10 text-light text-end awayIcon" type="text" placeholder="Away icon">
							</div>
							<div class="col-2 py-1 text-center">
								${commenceTime}
							</div>
							<div class="col-4">
								<input class="form-control form-control-sm bg-secondary bg-opacity-10 text-light homeIcon" type="text" placeholder="Home icon">
							</div>
							<div class="col-2">
								<div class="btn btn-sm btn-success w-100 list"
									data-keym="${value.id}" data-time="${value.commence_time}"
									data-cham="${value.sport_title}" data-away="${value.away_team}" data-home="${value.home_team}"
									data-odd0="${value.bookmakers[0].markets[0].outcomes[0].price}" data-odd1="${value.bookmakers[0].markets[0].outcomes[1].price}" data-odd2="${value.bookmakers[0].markets[0].outcomes[2].price}"
								>LIST IT!</div>
							</div>
						</div>
					</div>
					<div class="col-4 text-end">
						<strong>${value.away_team}</strong></br>Away <span class="badge bg-secondary">${value.bookmakers[0].markets[0].outcomes[0].price}</span>
					</div>
					<div class="col-2 text-center">
						Draw</br> <span class="badge bg-secondary">${value.bookmakers[0].markets[0].outcomes[2].price}</span>
					</div>
					<div class="col-4">
						<strong>${value.home_team}</strong></br><span class="badge bg-secondary">${value.bookmakers[0].markets[0].outcomes[1].price}</span> Home
					</div>
				</div>
			</div>
			`);
		});
	});	
});	
// --------------------------------------------------------------------------------------------------------------------------
// list
// --------------------------------------------------------------------------------------------------------------------------
$(document).on('click','.manager .list', function() {
	var keym = $(this).data('keym');
	var time = $(this).data('time'); var cham = $(this).data('cham');
	var away = $(this).data('away'); var home = $(this).data('home');
	var odd0 = $(this).data('odd0'); var odd1 = $(this).data('odd1'); var odd2 = $(this).data('odd2');
	var awayIcon = $('.m' + keym + ' .awayIcon').val(); var homeIcon = $('.m' + keym + ' .homeIcon').val();
	callClient({'event':'iBetting:list', 'keym':keym, 'cham':cham, 'time':time, 'away':away, 'home':home, 'odd0':odd0, 'odd1':odd1, 'odd2':odd2, 'awayIcon':awayIcon, 'homeIcon':homeIcon});
});	
// --------------------------------------------------------------------------------------------------------------------------
// bet
// --------------------------------------------------------------------------------------------------------------------------
$(document).on('click','.playing .bet', function() {
	var keym = $(this).data('keym'); var bet = $(this).data('bet');
	var cham = $('.playing .m' + keym).data('cham');
	var away = $('.playing .m' + keym).data('away');
	var home = $('.playing .m' + keym).data('home');
	var odd0 = $('.playing .m' + keym).data('odd0'); var odd1 = $('.playing .m' + keym).data('odd1'); var odd2 = $('.playing .m' + keym).data('odd2');
	$('.betting .placeBet .me-auto').html(cham);
	$('.betting .placeBet .away').html(away); $('.betting .placeBet .home').html(home);
	$('.betting .placeBet').data('keym', keym); $('.betting .placeBet').data('bet', bet);
	if($(this).data('bet') == 0)
	{
		$('.betting .placeBet .bet').html(away);$('.betting .placeBet .odd').html(odd0);
	}
	else if($(this).data('bet') == 1)
	{
		$('.betting .placeBet .bet').html(home);$('.betting .placeBet .odd').html(odd1);
	}
	else
	{
		$('.betting .placeBet .bet').html('Draw');$('.betting .placeBet .odd').html(odd2);
	}
	$('.betting .placeBet').toast('show');
});	
// --------------------------------------------------------------------------------------------------------------------------
// place bet
// --------------------------------------------------------------------------------------------------------------------------
$(document).on('click','.placeBet .submit', function() {
	var keym = $('.placeBet').data('keym'); var bet = $('.placeBet').data('bet'); var amount = $('.placeBet .amount').val();
	callClient({'event':'iBetting:bet', 'keym':keym, 'bet':bet, 'amount':amount});
	$('.betting .playing').toast('show');
});