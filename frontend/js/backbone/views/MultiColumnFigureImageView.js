// OsciTk Namespace Initialization //
if (typeof OsciTk === 'undefined'){OsciTk = {};}
if (typeof OsciTk.views === 'undefined'){OsciTk.views = {};}
// OsciTk Namespace Initialization //


OsciTk.views.MultiColumnFigureImage = OsciTk.views.MultiColumnFigure.extend({
	renderContent: function() {
		var container = this.$el.find(".figure_content");
		var containerHeight = container.height();
		var containerWidth = container.width();

		container.html(this.model.get('content'));
		container.children("img").css({
			height: containerHeight + "px",
			width: containerWidth + "px"
		});

		this.contentRendered = true;
	}
});