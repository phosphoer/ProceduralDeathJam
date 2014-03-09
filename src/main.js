function main()
{
  TANK.addComponents("World, Game, InputManager, RenderManager");

  TANK.RenderManager.context = document.getElementById("canvas").getContext("2d");
  TANK.InputManager.context = document.getElementById("stage");

  TANK.start();
}