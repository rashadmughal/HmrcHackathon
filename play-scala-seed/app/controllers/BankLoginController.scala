package controllers

import javax.inject.Inject

import play.api.mvc._

class BankLoginController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {

  def index() = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.bankLogin())
  }

  def submit = Action { implicit request: Request[AnyContent] =>
    Redirect("/#")
  }
}
