init_input = ->

	$(".nano").nanoScroller()

	# populate the generator pane
	for generator in ngens
		$("#generators").append("<div class='generator' id='#{generator.name}'></div>")
		$("##{generator.name}").append('<div class="generator-info"></div>')
		$("##{generator.name}").css("background-image", "url('img/#{generator.name}.png')")
		$("##{generator.name} .generator-info").append("<span class='generator-count' id='#{generator.name}_count'></span><br />
			Next: <span class='generator-cost' id='#{generator.name}_cost'>#{reprnum(generator.base_cost, "en-US", "short")}</span>")

	if $(window).width() >= 1024
		for generator in generators
			$("##{generator.name}").click(((name) -> (() -> gens[name].buy(1)))(generator.name))
	# if on a mobile platform, clicking on tooltips shouldn't autobuy.

	$("#goomy_container").mousedown (e) ->
		plus_marker = new PlusMarker("+#{reprnum(Math.floor(basedata.click()))}", e.clientX - 10 + Math.random() * 20, e.clientY - 10 + Math.random() * 20)

	$("#goomy_container").contextmenu( -> return false)

	$("#goomy_container").mousedown ->
		$("#great_goomy").css("width", "96%")
		$("#great_goomy").css("top", "2%")

	$("#goomy_container").mouseup ->
		$("#great_goomy").css("width", "100%")
		$("#great_goomy").css("top", "0%")

	$("#export_save_button").click ->
		a = export_save()
		$("#export_save_string").val(sstr_to_b64(a))
		$("#export_qr_code")[0].getContext("2d").clearRect(0, 0, 200, 200)
		$("#export_qr_code").qrcode({ text: a })
		$("#export_save").show()

	$("#about_button").click -> $("#about").show()
	$("#about_close").click -> $("#about").hide()
	$("#export_close").click -> $("#export_save").hide()
