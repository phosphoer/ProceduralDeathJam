TANK.registerComponent("Game")

.construct(function()
{
})

.initialize(function()
{
  TANK.RenderManager.clearColor = "#000";

  var e = TANK.createEntity("Player");
  TANK.addEntity(e, "Player");
});