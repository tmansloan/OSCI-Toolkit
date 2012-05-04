// OsciTk Namespace Initialization //
if (typeof OsciTk === 'undefined'){OsciTk = {};}
if (typeof OsciTk.models === 'undefined'){OsciTk.models = {};}
// OsciTk Namespace Initialization //

OsciTk.models.Figure = OsciTk.models.BaseModel.extend({
	defaults: function() {
		return {
			section_id: null,
			delta: null,
			caption: null,
			position: null,
			columns: null,
			aspect: 1,
			body: null,
			options: {}
		};
	}
});