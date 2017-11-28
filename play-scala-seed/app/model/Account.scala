package model

import play.api.libs.json._

case class Account(transactions: Seq[Transaction])
object Account{
  implicit val reads: Reads[Account] = Json.reads[Account]
}

case class Transaction(details: TransactionDetail)
object Transaction{
  implicit val reads: Reads[Transaction] = Json.reads[Transaction]
}

case class TransactionDetail(posted: String, new_balance: Money, value: Money)
object TransactionDetail {
  implicit val reads: Reads[TransactionDetail] = Json.reads[TransactionDetail]
}

case class Money(currency: String, amount: String)
object Money{
  implicit val reads: Reads[Money] = Json.reads[Money]
}