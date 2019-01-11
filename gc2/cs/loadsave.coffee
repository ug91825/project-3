load_save_from_local_storage = () ->

	if window.localStorage.hasOwnProperty("gc2.savefile") and window.localStorage["gc2.savefile"] != ""

		save_data = import_save(b64_to_sstr(window.localStorage["gc2.savefile"]))

		last_update_time.setTime(save_data["save_time"].getTime())

		if save_data["play_time"] != -1
			basedata.game_started = true
			basedata.play_time = save_data["play_time"]

		basedata.total_play_time = save_data["total_play_time"]
		basedata.goomies = save_data["goomies"]
		basedata.total_goomies = save_data["total_goomies"]
		basedata.total_total_goomies = save_data["total_total_goomies"]
		basedata.clicks = save_data["clicks"]
		basedata.total_clicks = save_data["total_clicks"]

		goomy.gain_exp(save_data["goomy_exp"])
		sliggoo.gain_exp(save_data["sliggoo_exp"])
		goodra.gain_exp(save_data["goodra_exp"])

		basedata.sliggoo_gpsmult = 1.0 + 0.1 * (sliggoo.level)
		goomy.level_cap = 100 + (goodra.level)

		for generator in generators
			generator.count = save_data.generators[generator.name].count
			generator.level = save_data.generators[generator.name].level
			generator.cost = generator.cost_f(generator.count)
			generator.lvup_cost = generator.base_cost * 100 * Math.pow(1.5, generator.level - 1)

		recalc()
		update_all_numbers()


import_save = (str) ->

	version = str.split("||", 1)[0]  # first instance of a number

	if version == "0.10"
		return _import_save_0_10(str)
	else if version == "0.05"
		return _import_save_0_05(str)




##########
# actual import methods
##########





# save file version 0.10
_import_save_0_10 = (str) ->

	save = {}

	data = str.split("||", 6)

	save_time = new Date()
	save_time.setTime(parseInt(data[1]))
	save["save_time"] = save_time

	d02_basedata = data[2].split("|")
	save["play_time"] = parseFloat(d02_basedata[0])
	save["total_play_time"] = parseFloat(d02_basedata[1])
	save["goomies"] = parseFloat(d02_basedata[2])
	save["total_goomies"] = parseFloat(d02_basedata[3])
	save["total_total_goomies"] = parseFloat(d02_basedata[4])
	save["clicks"] = parseFloat(d02_basedata[5])
	save["total_clicks"] = parseFloat(d02_basedata[6])

	d03_goomystats = data[3].split("|")
	save["goomy_exp"] = parseInt(d03_goomystats[0])
	save["sliggoo_exp"] = parseInt(d03_goomystats[1])
	save["goodra_exp"] = parseInt(d03_goomystats[2])

	generator_names = [
		"cursor",
		"youngster",
		"daycare",
		"reserve",
		"farm",
		"fountain",
		"cave",
		"trench",
		"arceus",
		"rngabuser",
		"cloninglab",
		"church",
		"gcminer",
		"photoncollider"
	]

	gen_data = {}
	d04_generators = data[4].split("|")
	for i in [0..14-1]
		datum = d04_generators[i].split(",")
		gen_data[generator_names[i]] = {
			count: parseInt(datum[0])
			level: parseInt(datum[1])
		}
	save["generators"] = gen_data

	d05_upgrades = data[5].split("|")
	d05_upgrades_bought = sstr_to_bitfield(d05_upgrades[0])
	d05_upgrades_unlocked = sstr_to_bitfield(d05_upgrades[1])
	for id in [1..200]
		if item_ids[id]
			if d05_upgrades_unlocked[id-1] == "1"
				item_ids[id].locked = false
				if d05_upgrades_bought[id-1] == "1"
					item_ids[id].bought = true

	return save







# save file version 0.05
_import_save_0_05 = (str) ->

	save = {}

	data = str.split("||", 5)

	save_time = new Date()
	save_time.setTime(parseInt(data[1]))
	save["save_time"] = save_time

	d02_basedata = data[2].split("|")
	save["play_time"] = parseFloat(d02_basedata[0])
	save["total_play_time"] = parseFloat(d02_basedata[1])
	save["goomies"] = parseFloat(d02_basedata[2])
	save["total_goomies"] = parseFloat(d02_basedata[3])
	save["total_total_goomies"] = parseFloat(d02_basedata[4])
	save["clicks"] = parseFloat(d02_basedata[5])
	save["total_clicks"] = parseFloat(d02_basedata[6])

	d03_goomystats = data[3].split("|")
	save["goomy_exp"] = parseInt(d03_goomystats[0])
	save["sliggoo_exp"] = parseInt(d03_goomystats[1])
	save["goodra_exp"] = parseInt(d03_goomystats[2])

	generator_names = [
		"cursor",
		"youngster",
		"daycare",
		"reserve",
		"farm",
		"fountain",
		"cave",
		"trench",
		"arceus",
		"rngabuser",
		"cloninglab",
		"church",
		"gcminer",
		"photoncollider"
	]

	gen_data = {}
	d04_generators = data[4].split("|")
	for i in [0..14-1]
		datum = d04_generators[i].split(",")
		gen_data[generator_names[i]] = {
			count: parseInt(datum[0])
			level: parseInt(datum[1])
		}
	save["generators"] = gen_data


	return save
