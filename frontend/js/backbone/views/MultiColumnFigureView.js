// OsciTk Namespace Initialization //
if (typeof OsciTk === 'undefined'){OsciTk = {};}
if (typeof OsciTk.views === 'undefined'){OsciTk.views = {};}
// OsciTk Namespace Initialization //


OsciTk.views.MultiColumnFigure = OsciTk.views.BaseView.extend({

	tagName: 'figure',
	template: OsciTk.templateManager.get('multi-column-figure'),
	layoutComplete: false,
	sizeCalculated: false,
	calculatedHeight: 0,
	calculatedWidth: 0,
	position: {x:[0,0], y:[0,0]},

	initialize: function() {
		this.$el.css("visibility", "hidden").attr("id", this.model.get("id"));
	},

	render: function() {
		//template the element
		this.$el.html(this.template(this.model.toJSON()));

		//calculate the size based on layout hints
		this.sizeElement();

		//position the element on the page
		var isPositioned = this.positionElement();

		if (isPositioned) {
			this.layoutComplete = true;
		}

		this.$el.css("visibility", "visible");

		return this;
	},

	renderContent: function() {
		this.$el.find(".figure_content").html(this.model.get('content'));
	},

	positionElement: function() {
		var modelData = this.model.toJSON();
		var dimensions = this.options.sectionDimensions;

		//if element shouold not be visible on the page, hide it and return
		if (modelData.position.vertical === "n") {
			this.$el.hide();
			return true;
		}

		var column;
		//Detemine the start column based on the layout hint
		switch (modelData.position.horizontal) {
			//right
			case 'r':
				column = dimensions.columnsPerPage - 1;
				break;
			//left & fullpage
			case 'l':
			case 'p':
				column = 0;
				break;
			//In the current column
			default:
				column = this.parent.processingData.currentColumn;
		}

		var positioned = false;
		var numColumns = this.model.get('columns');
		var offsetLeft = 0;
		var offsetTop = 0;

		whilePositioned:
		while (!positioned) {
			//Detemine the left offset start column and width of the figure
			if ((column + numColumns) > dimensions.columnsPerPage) {
				column -= (column + numColumns) - dimensions.columnsPerPage;
			}

			//If the figure is not as wide as the available space, center it
			var availableWidth = (dimensions.columnWidth * numColumns) + ((numColumns - 1) * dimensions.gutterWidth);
			var addLeftPadding = 0;
			if (this.calculatedWidth < availableWidth) {
				addLeftPadding = Math.floor((availableWidth - this.calculatedWidth) / 2);
			}

			offsetLeft = (column * dimensions.columnWidth) + (column * dimensions.gutterWidth) + addLeftPadding;
			this.$el.css("left", offsetLeft + "px");

			//Determine the top offset based on the layout hint
			switch (modelData.position.vertical) {
				//top & fullpage
				case 't':
				case 'p':
					offsetTop = 0;
					break;
				//bottom
				case 'b':
					offsetTop = dimensions.innerSectionHeight - this.calculatedHeight;
					break;
			}
			this.$el.css("top", offsetTop + "px");

			var figureX = [offsetLeft, offsetLeft + this.calculatedWidth];
			var figureY = [offsetTop, offsetTop + this.calculatedHeight];
			this.position = {
				x : figureX,
				y : figureY
			};

			positioned = true;

			if (offsetLeft < 0 || figureX[1] > dimensions.innerSectionWidth) {
				positioned = false;
			}

			//check if current placement overlaps any other figures
			var pageFigures = this.parent.getChildViewsByType('figure');
			var numPageFigures = pageFigures.length;
			if (positioned && numPageFigures && numPageFigures > 1) {
				for (i = 0; i < numPageFigures; i++) {
					if (pageFigures[i].cid === this.cid) {
						continue;
					}

					var elemX = pageFigures[i].position.x;
					var elemY = pageFigures[i].position.y;

					if (figureX[0] < elemX[1] && figureX[1] > elemX[0] &&
						figureY[0] < elemY[1] && figureY[1] > elemY[0]
					) {
						positioned = false;
						break;
					}
				}
			}

			if (!positioned) {
				//adjust the start column to see if the figure can be positioned on the page
				switch (modelData.position.horizontal) {
					//right
					case 'r':
						column--;
						if (column < 0) {
							break whilePositioned;
						}
						break;
					//left & fullpage
					case 'l':
					case 'p':
						column++;
						if (column >= dimensions.columnsPerPage) {
							break whilePositioned;
						}
						break;
					//no horizontal position
					default:
						column++;
						if ((column + columns) > dimensions.columnsPerPage) {
							column = 0;
						}
				}
			}
		}

		return positioned;
	},

	sizeElement: function() {
		var width, height;
		var dimensions = this.options.sectionDimensions;
		var modelData = this.model.toJSON();

		//Only process size data on first attempt to place this figure
		if (this.sizeCalculated || modelData.position === "n") {
			this.calculatedHeight = this.$el.height();
			this.calculatedWidth = this.$el.width();
			return this;
		}

		//If a percentage based width hint is specified, convert to number of columns to cover
		if (typeof(modelData.columns) === 'string' && modelData.columns.indexOf("%") > 0) {
			modelData.columns = Math.ceil((parseInt(modelData.columns, 10) / 100) * dimensions.columnsPerPage);
		}

		//Calculate maximum width for a figure
		if (modelData.columns > dimensions.columnsPerPage || modelData.position === 'p') {
			width = dimensions.innerSectionWidth;
			modelData.columns = dimensions.columnsPerPage;
		} else {
			width = (modelData.columns * dimensions.columnWidth) + (dimensions.gutterWidth * (modelData.columns - 1));
		}
		this.$el.css("width", width + "px");

		//Get the height of the caption
		var captionHeight = this.$el.find("figcaption").outerHeight(true);

		//Calculate height of figure plus the caption
		height = (width / modelData.aspect) + captionHeight;

		//If the height of the figure is greater than the page height, scale it down
		if (height > dimensions.innerSectionHeight) {
			height = dimensions.innerSectionHeight;

			//set new width and the new column coverage number
			width = (height - captionHeight) * modelData.aspect;
			this.$el.css("width", width + "px");

			//update caption height at new width
			captionHeight = this.$el.find("figcaption").outerHeight(true);

			//update column coverage
			modelData.columns = Math.ceil((width + dimensions.gutterWidth) / (dimensions.gutterWidth + dimensions.columnWidth));
		}

		//round the height/width to 2 decimal places
		width = roundNumber(width,2);
		height = roundNumber(height,2);

		this.$el.css({ height : height + "px", width : width + "px"});

		this.calculatedHeight = height;
		this.calculatedWidth = width;

		//update model number of columns based on calculations
		this.model.set('columns', modelData.columns);

		//Set the size of the figure content div inside the actual figure element
		this.$el.find('.figure_content').css({
			width : width,
			height : height - captionHeight
		});

		this.sizeCalculated = true;
		return this;
	}
});