package controllers

import javax.inject.{Inject, _}

import play.api.libs.ws._
import play.api.mvc._

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.concurrent.ExecutionContext.Implicits.global

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class VatCalculationController @Inject()(cc: ControllerComponents, ws: WSClient) extends AbstractController(cc) {

  /**
    * Create an Action to render an HTML page.
    *
    * The configuration in the `routes` file means that this method
    * will be called when the application receives a `GET` request with
    * a path of `/`.
    */
  def index() = Action { implicit request: Request[AnyContent] =>

    val transactions = ws.url("https://ahlisandbox.com/obp/v1.2.1/banks/ahli.01.uk.uk/accounts/3/owner/transactions")
      .addHttpHeaders("Authorization" -> "DirectLogin token=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIiOiIifQ.mcUjcuLoP4g2s05jCY-rS5icsSjCZPkJuZyBOPB6zAY\"")
      .get().map(res => res.body)
    val str = Await.result(transactions, Duration.fromNanos(1000000000))

    Ok(views.html.vatCalculation(str))
  }
}
