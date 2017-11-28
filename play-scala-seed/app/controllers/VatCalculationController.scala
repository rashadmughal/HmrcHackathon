package controllers

import javax.inject.{Inject, _}

import model.Account
import play.api.libs.json.Reads
import play.api.libs.ws._
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

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
  def index(): Action[AnyContent] = Action.async{ implicit request =>
    val rate = 0.165
    for {
      res <- ws.url("https://ahlisandbox.com/obp/v1.2.1/banks/ahli.01.uk.uk/accounts/1/owner/transactions")
        .addHttpHeaders("Authorization" -> "DirectLogin token=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIiOiIifQ.mcUjcuLoP4g2s05jCY-rS5icsSjCZPkJuZyBOPB6zAY\"")
        .get().map(res => res.json.as[Account])

      trans <- Future(res.transactions.map(a => AccTrans(a.details.posted, BigDecimal(a.details.value.amount),  BigDecimal(a.details.value.amount) * rate)))

      vat <- Future(VatCalc(trans, trans.map(_.value).sum * rate))

      res <- Future.successful(Ok(views.html.vatCalculation(vat)))
    } yield res
  }
}

case class VatCalc(transactions: Seq[AccTrans], amountDue: BigDecimal)

case class AccTrans(date: String, value: BigDecimal, vat: BigDecimal)
