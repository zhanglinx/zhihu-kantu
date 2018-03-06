$(document).ready(function () {
	$(document).keydown(function (e) {
		flag = true;
		if (e.altKey && e.ctrlKey && e.which === 68) {
			if (flag) {
				// document.getElementsByClassName('Button QuestionMainAction')[0].click();
				main();
				flag = false;
			}
		}
	});
});

function main() {
	var getUrl = window.location.href;
	var urlback = window.location.pathname;
	var allImagesUrl = [];
	var issrc = false
	var reguc = /collection/;
	var reguq = /question/;
	var regue = /explore/;
	var regup = /people/;
	var homeurl = 'https://www.zhihu.com/'
	//收餐夹页面
	if (reguc.test(urlback) || regue.test(urlback)) {
		var allImages = $('.zm-item').find('.content');
		if (allImages.length == 0) {
			var allImages = $('.zm-item-rich-text').find('.content');
		}

		//问题页
	} else if (reguq.test(urlback)) {
		var allImages = $('.List-item').find('noscript');

		//个人页
	} else if (regup.test(urlback) || (homeurl == getUrl)) {
		//把所有的答案都点开
		buttons = $(".ContentItem-more");
		buttons.each(function (index, image) {
			$(this).click();
		});

		var allImages = $('.CopyrightRichText-richText').find('img');
		allImages.each(function (index, image) {
			var x = $(this)[0].src;
			if (x) {
				allImagesUrl.push(x);
			}
		});
		issrc = true;
	}

	// var allImagesView = $('.List').find('.lazy');
	var allImagesHtml = [];
	var viewportWidth = $(window).width();
	var viewportHeight = window.innerHeight;
	var maxImages = 0;
	var unitWidth = 0;
	var maxWidth = 0;
	var log = console.log.bind(console);
	var prevButton = {};
	var nextButton = {};
	var total = {};
	var current = {};
	var viewer = {};
	var imageHolder = {};
	var isPresented = false;


	re = /https:.{0,80}_r.*?g/g;
	if (!issrc) {
		allImages.each(function (index, image) {
			var x = $(this).text().match(re);
			if (x) {
				allImagesUrl.push.apply(allImagesUrl, x)
			}
		});
	}



	$('<div class="viewer">' +
		'<div class="window" data-index="0"></div>' +
		'<div class="close-window"></div>' +
		'<div class="paginator">' +
		'<div class="paginator-right paginator-each"></div>' +
		'<div class="paginator-left paginator-each"></div>' +
		'</div>' +
		'<div class="nav"><span class="current"></span><span class="slash">/</span><span class="total"></span></div>' +
		'</div>' +
		'<div class="mask"></div>').appendTo($('body'));

	viewer = $('.viewer');
	viewer.css('width', viewportWidth + 'px').css('height', viewportHeight + 'px');

	imageHolder = $('.window');
	for (var i = 0; i < allImagesUrl.length; i++) {
		allImagesHtml.push('<div class="image"><img src="' + allImagesUrl[i] + '" data-index=' + (i + 1) + '"></div>');
	}
	$(allImagesHtml.join('')).appendTo(imageHolder);

	maxImages = allImagesUrl.length;
	total = $('.total');
	current = $('.current');
	total.text(parseInt(maxImages) - 1);
	current.text(1);
	prevButton = $('.paginator-left');
	nextButton = $('.paginator-right');
	if (maxImages === 0) {
		$('<h1 class="viewer-tip">此问题下没有图片</h1>').appendTo(imageHolder);
		nextButton.hide();
	}
	if (maxImages === 1) {
		nextButton.hide();
	}
	//把页面滑动到最下面
	function turnPage(cn) {
		a = $('.' + cn);
		lastItem = a[a.length - 1];
		lastItem.scrollIntoView(true);
	}

	function prevPic() {
		var currentPosition = parseInt(imageHolder.data('index'));
		if (currentPosition !== 0) {
			imageHolder.css('right', (currentPosition - 1) * 100 + '%');
			imageHolder.data('index', currentPosition - 1);
			current.text(currentPosition - 1);
		}
		if (currentPosition === 1) {
			prevButton.fadeOut(400);
			nextButton.fadeIn(400);
		}
	}

	function nextPic() {
		var currentPosition = parseInt(imageHolder.data('index'));
		prevButton.fadeIn(400);
		if (currentPosition < maxImages - 1) {
			imageHolder.css('right', (currentPosition + 1) * 100 + '%');
			imageHolder.data('index', currentPosition + 1);
			current.text(currentPosition + 1);
		}
		if (currentPosition === maxImages - 2) {
			nextButton.fadeOut(400);
		}
	}

	function shortCuts(e) {
		/* key code 39 -> arrow right
		 ** key code 37 -> arrow left
		 ** key code 27 -> ESC
		 */
		if (e.which === 39) {
			nextPic();
		} else if (e.which === 37) {
			prevPic();
		} else if (e.which === 27) {
			stop();
		}
	}

	function start() {
		isPresented = true;
		viewer.fadeIn(400);
		$('.mask').fadeIn(400);
		$('.AppHeader').css('display', 'none');
		$('body').css('overflow', 'hidden');
		unitWidth = imageHolder.width();
		maxWidth = (maxImages - 1) * unitWidth;
		prevButton.click(prevPic);
		nextButton.click(nextPic);
		$('.close-window').click(stop)
		$(document).keydown(shortCuts);
	}

	function stop() {
		isPresented = false;
		viewer.fadeOut(400);
		$('.mask').hide();
		$('.AppHeader').css('display', '');
		$('body').css('overflow', 'visible');
		prevButton.off('click');
		nextButton.off('click');
		$('.close-window').off('click');
		$(document).off('keydown', shortCuts);
	}

	function getQueryString(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		var r = window.location.search.substr(1).match(reg);

		if (r != null) {
			return unescape(r[2]);
		}
		return null;
	}

	$(window).resize(function () {
		viewer.css('width', $(window).width() + 'px').css('height', window.innerHeight + 'px');
		unitWidth = imageHolder.width();
		maxWidth = (maxImages - 1) * unitWidth;
	})

	$(document).keydown(function (e) {
		if (e.altKey && e.ctrlKey && e.which === 70) {
			if (isPresented) {
				stop();
			} else {
				start();
			}
		}
	});

	chrome.runtime.sendMessage('showPageAction');

}