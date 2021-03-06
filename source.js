const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const priceList = { "콜라": 1100, "물": 600, "커피": 700 } // 판매상품 가격리스트
const products = Object.keys(priceList);
const coinList = ["100", "500", "1000", "5000", "10000"]; // 사용가능한 화폐단위 리스트
let payment = ''; // 지불수단
let balance = 0; // 남은잔액
let isFinished = false; // 거래 종료 여부

// 사용자의 의견을 듣는 로직
const question = (theQuestion) => {
  return new Promise(resolve => rl.question(theQuestion, answ => resolve(answ)))
}

// 거래 종료를 묻는 로직
const requestForChange = async () => {
  let isOk = true;
  let answer = '';
  do {
    answer = await question("거래를 종료하시겠습니까?(Yes / No) >> ");
    if (answer !== "Yes" && answer !== "No") {
      isOk = false;
      console.log("Yes 또는 No로 정확하게 답변해주시길 바랍니다.");
    } else { isOk = true }
  } while (isOk === false)
  return answer;
}

// 거래를 종료시키고, 잔돈을 반환하는 로직
const finish = () => {
  console.log('거래를 종료합니다. 잔돈반환 : ' + balance);
  isFinished = true;
}

// 결제수단을 확인하는 로직
const paymentCheck = async () => {
  const answer = await question("결제수단을 선택해주세요 >> ");
  payment = answer;
  // 입력방식이 잘못된 경우
  if (answer !== "현금" && answer !== "카드") {
    // 잘못된 요청임을 사용자에게 알림
    console.log("결제수단은 [현금] 또는 [카드]로만 선택할 수 있습니다.");
    const finishAnsw = await requestForChange();
    if (finishAnsw === "Yes") {
      finish();
      return;
    } else {
      await paymentCheck();
    }
  } else {
    console.log(`결제수단 ${answer}이 선택되었습니다.`)
  }
}

// 현금을 투입받는 로직
const insertCoin = async () => {
  if (isFinished !== true && payment === "현금") {
    // 현금을 투입받고, 사용할 수 없는 화폐단위인 경우, 다시 반환한다.
    const coinValue = await question("화폐단위를 입력해주세요 >> ");
    const coinQuantity = await question("수량을 입력해주세요 >> ");
    if (!coinList.includes(coinValue) || isNaN(coinQuantity)) {
      console.log("현금 투입을 정확하게 해주시길 바랍니다");
      console.log("투입된 현금은 반환됩니다.");
      await insertCoin();
      return;
    }

    const paidValue = Number(coinValue) * Number(coinQuantity);
    balance += paidValue;
    console.log(`화폐단위: ${coinValue}, 화폐수량: ${coinQuantity}가 선택되었습니다`);
    console.log(`현재 총 금액 : ${balance}`);

    let isOk = true;
    let answer = '';
    do {
      answer = await question("현금투입을 계속하시겠습니까?(Yes / No) >> ");
      if (answer !== "Yes" && answer !== "No") {
        console.log("Yes 또는 No로 정확하게 답변해주시길 바랍니다.");
        isOk = false;
      } else {
        isOk = true;
      }
    } while (isOk === false);

    if (answer === "Yes") {
      // 현금투입을 계속하길 원하는 경우.
      await insertCoin();
    } 
  }
}

// 음료를 선택하는 로직
const select = async () => {
  if (isFinished !== true && payment === "현금") {
    // 사용자가 음료를 선택한다.
    const picked = await question(`어떤 상품을 선택하시겠습니까?(콜라 / 물 / 커피) 
    거래 종료를 원하시는 "종료"라고 입력해주세요 >> `);
    // 상품 선택과정에서 거래 종료를 원할 경우.
    if (picked === "종료") {
      finish();
    } else if (!products.includes(picked)) {
      // 판매가능한 상품인지 확인한다.
      console.log("상품은 [콜라], [물], [커피] 중에서만 선택할 수 있습니다.");
      await select();
    } else if (balance < priceList[picked]) {
      // 투입한 금액이 부족하지는 않은지 확인한다.
      console.log("투입한 금액이 부족합니다.")
      // 금액을 더 투입할지 여부를 묻는다.
      let isOk = true;
      let answer = ''
      do {
        answer = await question("금액을 더 투입하시겠습니까?(Yes / No) >> ");
        if (answer !== "Yes" && answer !== "No") {
          isOk = false;
          console.log("Yes 또는 No로 정확하게 답변해주시길 바랍니다.");
        } else { isOk = true }
      } while (isOk === false)

      // 현금 추가투입을 원하는 경우.
      if (answer === "Yes") {
        await insertCoin();
        await select();
      } else {
        // 현금 추가투입을 원치 않는 경우.
        const finishAnsw = await requestForChange();

        // 거래의 종료를 원하는 경우.
        if (finishAnsw === "Yes") {
          finish();
          return;
        } else {
          console.log("다시 상품을 선택해주시길 바랍니다.");
          await select();
        }
      }
    } else {
      console.log(`짜잔!! 선택하신 음료 [${picked}] 나왔습니다!!`)
      // 구매한만큼 현재 투입금액에서 차감한다.
      balance -= priceList[picked];
      console.log(`현재 남은 금액은 ${balance}입니다.`)

      // 추가구매를 원하는지 물어본다.
      let isOk = true;
      let answer2 = '';
      do {
        answer2 = await question("상품을 추가로 구매하시겠습니까?(Yes / No) >> ");
        if (answer2 !== "Yes" && answer2 !== "No") {
          console.log("Yes 또는 No로 정확하게 답변해주시길 바랍니다.")
          isOk = false;
        } else { isOk = true }
      } while (isOk === false)

      if (answer2 === "Yes") {
        // 추가 구매를 원하는 경우.
        await select();
      } else {
        // 추가 구매를 원치않는 경우.
        finish();
      }
    }
  }
}

// 카드결재 시 카드승인을 받는 로직
const payForCard = () => {
  if (payment === "카드") {
    // 해당 카드사에 결재승인을 받는다.
    console.log("카드승인 요청중입니다...")
    return new Promise(resolve => {
      setTimeout(() => {
        console.log("카드승인이 완료되었습니다!");
        resolve();
      }, 3000)
    })
  }
}

// 카드결재시 음료를 선택하는 로직
const selectForCard = async () => {
  if (payment === "카드") {
    // 사용자가 음료를 선택한다.
    const picked = await question(`어떤 상품을 선택하시겠습니까?(콜라 / 물 / 커피) 
    거래 종료를 원하시는 "종료"라고 입력해주세요 >> `);
    if (picked === "종료") {
      finish();
    } else if (!products.includes(picked)) {
      // 판매가능한 상품인지 확인한다.
      console.log("상품은 [콜라], [물], [커피] 중에서만 선택할 수 있습니다.");
      await selectForCard();
    } else {
      console.log(`짜잔!! 선택하신 음료 [${picked}] 나왔습니다!!`);
      console.log(`상품금액 ${priceList[picked]}원이 결재되었습니다.`);
    }
  }
}

exports.modules = { rl, question, requestForChange, finish, paymentCheck, insertCoin, select, payForCard, selectForCard }
