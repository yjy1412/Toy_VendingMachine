const { rejects } = require("assert");
const { resolve } = require("path/posix");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const priceList = { "콜라": 1100, "물": 600, "커피": 700 } // 판매상품 가격리스트
const products = Object.keys(priceList);
const coinList = ["100", "500", "1000", "5000", "10000"]; // 사용가능한 화폐단위 리스트
let payment = ''; // 지불수단
let balance = 0; // 잔액
let isFinished = false; // 거래를 강제종료

// 사용자에게 어떻게 처리할지 요청하는 로직
const question = (theQuestion) => {
  return new Promise(resolve => rl.question(theQuestion, answ => resolve(answ)))
}

// 프로세스 진행 중, 종료하고 잔돈을 반환받고 싶은 경우 요청하는 로직
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

// 로직에 따른 프로세스 강제 종료
const finish = () => {
  console.log('거래를 종료합니다. 잔돈반환 : ' + balance);
  isFinished = true;
}

// 결제수단 선택
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

// 현금투입
const inserCoin = async () => {
  if (isFinished !== true) {
    // 현금을 투입받고, 사용할 수 없는 화폐단위인 경우, 다시 반환한다.
    const coinValue = await question("화폐단위를 입력해주세요 >> ");
    const coinQuantity = await question("수량을 입력해주세요 >> ");
    if (!coinList.includes(coinValue) || isNaN(coinQuantity)) {
      console.log("현금 투입을 정확하게 해주시길 바랍니다");
      console.log("투입된 현금은 반환됩니다.");
      await inserCoin();
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
      await inserCoin();
    } else {
      // 현금투입을 멈추는 경우.
      const finishAnsw = await requestForChange();
      if (finishAnsw === "Yes") {
        finish();
      }
    }
  }
}

// 상품선택 및 결제
const select = async () => {
  if (isFinished !== true) {
    // 사용자가 음료를 선택한다.
    const picked = await question("어떤 상품을 선택하시겠습니까?(콜라 / 물 / 커피) >> ");
    // 판매가능한 상품인지 확인한다.
    if (!products.includes(picked)) {
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
        await inserCoin();
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

const payForCard = () => {
  // 해당 카드사에 결재승인을 받는다.
  console.log("결재승인 요청중입니다...")
  console.log("결제승인이 완료됐습니다")
}

const selectForCard = async () => {
  if (isFinished !== true) {
    // 사용자가 음료를 선택한다.
    const picked = await question("어떤 상품을 선택하시겠습니까?(콜라 / 물 / 커피) >> ");
    // 판매가능한 상품인지 확인한다.
    if (!products.includes(picked)) {
      console.log("상품은 [콜라], [물], [커피] 중에서만 선택할 수 있습니다.");
      await selectForCard();
    } else {
      console.log(`짜잔!! 선택하신 음료 [${picked}] 나왔습니다!!`);
      console.log(`${priceList[picked]} 결재되었습니다.`);
    }
  }
}


const main = async () => {
  await paymentCheck();
  if (payment === "현금") {
    // 결제수단이 현금인 경우.
    await inserCoin();
    await select();
  } else {
    // 결제수단이 카드인 경우.
    await payForCard();
    await selectForCard();
  }

  rl.close()
}
main();



