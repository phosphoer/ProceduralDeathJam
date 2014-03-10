TANK.registerComponent("Game")

.construct(function()
{
})

.initialize(function()
{
  TANK.RenderManager.clearColor = "#aaa";

  var e = TANK.createEntity("Player");
  e.Pos2D.x = TANK.World.spawnPos[0];
  e.Pos2D.y = TANK.World.spawnPos[1];
  TANK.addEntity(e);
});