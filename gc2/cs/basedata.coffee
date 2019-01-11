basedata =

	version: "0.363 (pre-alpha)",

	game_started: false,

	goomies: 0,

	total_goomies: 0,   # total goomies, counting ones used in purchases
	total_total_goomies: 0,   # total goomies, counting ones used in reset

	play_time: 0,   # play time in seconds of current session
	total_play_time: 0,   # total play time over all sessions

	last_save_time: new Date()	# date and time of last save, for perfect idle calc

	gps: 0,
	expps: 0,
	gpc: 1,

	sliggoo_gpsmult: 1.0,

	raindance_mult: 1.0,
	frenzy_clickmult: 1.0,
	exp_clickmult: 1.0,

	clicks: 0,   # number of times the Great Goomy was clicked
	total_clicks: 0,

	earn: (n) ->
		@goomies += n
		@total_goomies += n
		@total_total_goomies += n

	click: ->

		if !@game_started
			@game_started = true

		gain = @gpc

		@earn(gain)
		@clicks += 1
		@total_clicks += 1
		goomy.gain_exp(goomy.level * @exp_clickmult)
		return gain

	update: (ms) ->

		gain = @gps * ms / 1000
		@earn(gain)

		exp_gain = @expps * ms / 1000
		goomy.gain_exp (exp_gain)

		if @game_started
			@play_time += ms
			@total_play_time += ms

	reset: ->
		# calculate prestige bonuses
		sliggoo.gain_exp (@total_goomies / 1e12)
		goodra.gain_exp (goomy.exp / 1e4)

		# Sliggoo gives a GPS multiplier boost.
		@sliggoo_gpsmult = 1.0 + 0.1 * (sliggoo.level)
		# Goodra raises the level cap.
		goomy.level_cap = 100 + (goodra.level)

		@goomies = 0
		@total_goomies = 0
		# @total_total_goomies is untouched.

		goomy.exp = 0
		goomy.level = 1
		goomy.next_lv_exp = 100
		goomy.lv_total_exp = 0

		@game_started = false
		@play_time = 0

		@clicks = 0
		for generator in generators
			generator.count = 0
			generator.cost = generator.base_cost
			generator.level = 1
			generator.upgrades = []

		for item in itemlist
			item.bought = false

		recalc()
		update_all_numbers()
		regenerate_tooltips()

# DEBUG: expose basedata to access variables.

@basedata = basedata
