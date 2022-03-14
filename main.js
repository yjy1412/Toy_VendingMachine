const func = require('./source');
const { rl, question, requestForChange, finish, paymentCheck, insertCoin, select, payForCard, selectForCard } = func.modules;

const main = async () => {
  await paymentCheck();
  // 결제수단이 현금인 경우.
  await insertCoin();
  await select();
  // 결제수단이 카드인 경우.
  await payForCard();
  await selectForCard();
  rl.close()
}
main();



