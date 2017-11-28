package controllers

import java.lang.ProcessBuilder.Redirect
import javax.inject._
import play.api._
import play.api.mvc._

class LoginController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.ggLogin())
  }

  def submit() = Action { implicit request: Request[AnyContent] =>
    //Ok(views.html.startPage())
    Redirect(routes.HomeController.index())
  }
}
