# GCM = generator click multiplier, I think?

gcm1 = new Item("gcm1", 1)
gcm1.unlock_condition = -> goomy.level >= 5
gcm1.cost = 1e4

gcm2 = new Item("gcm2", 2)
gcm2.unlock_condition = -> goomy.level >= 10
gcm2.cost = 1e5

gcm3 = new Item("gcm3", 3)
gcm3.unlock_condition = -> goomy.level >= 20
gcm3.cost = 1e7

gcm4 = new Item("gcm4", 4)
gcm4.unlock_condition = -> goomy.level >= 40
gcm4.cost = 1e10

gcm5 = new Item("gcm5", 5)
gcm5.unlock_condition = -> goomy.level >= 80
gcm5.cost = 1e14



click1 = new Item("click1", 6)
click1.unlock_condition = -> goomy.level >= 100
click1.cost = 1e16








# youngster ball upgrades
ball01 = new Item("ball01", 7)
ball01.unlock_condition = -> goomy.level >= 10 && gens["youngster"].count >= 10
ball01.cost = 1e4

ball02 = new Item("ball02", 8)
ball02.unlock_condition = -> goomy.level >= 30 && gens["youngster"].count >= 50
ball02.cost = 1e8

ball99 = new Item("ball99", 9)
ball99.unlock_condition = -> goomy.level >= 100
ball99.cost = 1e15






# youngster upgrades
youngster01 = new Item("youngster01", 51)
youngster01.unlock_condition = -> gens["daycare"].count >= 50 && gens["youngster"].count >= 100
youngster01.cost = 6e6

youngster02 = new Item("youngster02", 52)
youngster02.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 200
youngster02.cost = 3e7

youngster03 = new Item("youngster03", 53)
youngster03.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 300
youngster03.cost = 15e7

youngster04 = new Item("youngster04", 54)
youngster04.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 400
youngster04.cost = 7e8

youngster05 = new Item("youngster05", 55)
youngster05.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 500
youngster05.cost = 4e9

youngster06 = new Item("youngster06", 56)
youngster06.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 600
youngster06.cost = 24e9

youngster07 = new Item("youngster07", 57)
youngster07.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 700
youngster07.cost = 2e11

youngster08 = new Item("youngster08", 58)
youngster08.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 800
youngster08.cost = 134217728e4

youngster09 = new Item("youngster09", 59)
youngster09.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 900
youngster09.cost = 1.44e13

youngster10 = new Item("youngster10", 60)
youngster10.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 1000
youngster10.cost = 24.192e13

youngster11 = new Item("youngster11", 61)
youngster11.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 1100
youngster11.cost = 5497558138880000

youngster12 = new Item("youngster12", 62)
youngster12.unlock_condition = -> gens["reserve"].count >= 50 && gens["youngster"].count >= 1200
youngster12.cost = 259020683712000000
