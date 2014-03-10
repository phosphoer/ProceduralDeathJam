TANK.registerComponent("Game")

.construct(function()
{
})

.initialize(function()
{
  var e = TANK.createEntity("Player");
  e.Pos2D.x = 1;
  e.Pos2D.y = 1;
  TANK.addEntity(e);
});