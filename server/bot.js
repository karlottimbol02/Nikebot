const puppeteer = require("puppeteer-extra");
const pluginStealth = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const { installMouseHelper } = require("./extras/install_mouse_helper");
//puppeteer.use(pluginStealth());

// Debugging stuff
const html_path = "htmls/bot_";
const screenshot_path = "screenshots/bot_";
const SimpleNodeLogger = require("simple-node-logger"),
  opts = {
    logFilePath: "logs/" + "bot1.log",
    timestampFormat: "YYYY-MM-DD HH:mm:ss.SSS",
  };

let html = "";

// ####################################
// ####################################
// Parameters to set

// user/pass: the email/username for your Nike.com account
const email = "hamstomj@gmail.com";
const pass = "Hamstomj@920";
// const first_name = "ham";
// const last_name = "stom";
// const user_id = "hams354198353";
// const address_first_line = "2315 Us Highway 275";
// const city = "Sidney";
// const state = "lowa";
// const zipcode = "51652-6078";
// const phone_number = "2138144239";

// cv_code: 3-digit credit card validation code for the card saved to your Nike.com account
const card_name = "visa";
const card_number = "4242424242424242";
const expire_date = "0124";
const cv_code = "123";

// size: the shoe size, as you see in the table of sizes on a product page, e.g., 'M 9 / W 10.5'
const size = "US 12";

// url: url to the shoe page, e.g., 'https://www.nike.com/us/launch/t/kobe-4-protro-wizenard/'
const url = "https://www.nike.com/au/t/jordan-aerospace-720-shoe-td3XcH/CW7588-100";

// debug: Use debug/logging features?
// Includes writing updates to log file, writing html snapshots, and taking screenshots
const debug = true;

// buy: ****WARNING**** if you set this to true it *may* actually make a purchase
// you can leave this to false and the bot will not "submit order"
const buy = true;

// ####################################
// ####################################
// main flow
(async () => {
  const class_names = {
    shop_page: {
      size_form: ".add-to-cart-form > div > fieldset",
      sizes_fields: ".add-to-cart-form > div > fieldset > div > div > label",
      add_to_cart_button: ".add-to-cart-form > div > #floating-atc-wrapper button.add-to-cart-btn",
      checkout_modal: ".js-modal.fx-modal",
      modal_checkout_button: "button[data-test='qa-cart-checkout']",
    },
    cart_page: {
      popover_form: ".popup-drawer",
      choose_checkout_button: "button.e1qel1sl1",
      member_checkout_button: "button.e1qel1sl4",
      guest_checkout_button: "button.e1qel1sl4",
    },
    login_modal: {
      login_form: "#nike-unite-loginForm",
      email_input: ".emailAddress > input",
      password_input: ".password > input",
      login_button: ".loginSubmit > input",
    },
    credit_page: {
      credit_page_instance: ".order-content",
      checkbox: "#gdprSection .checkbox-container > input",
      shipping_submit: "#shippingSubmit",
      billing_submit: "#billingSubmit",
      payment_card_option: "#PaymentCard_option",
      credit_form: "#SSLForm",
      credit_card_holder: "#CreditCardHolder",
      credit_card_number_input: "#KKnr",
      expire_date_input: "#KKExpiryDate",
      security_code_input: "#CCCVC",
      place_order: "#BtnPurchase",
    },
  };
  const args = ["--disable-web-security", "--disable-features=IsolateOrigins,site-per-process"];

  const browser = await puppeteer.launch({
    ignoreHTTPSErrors: true,
    headless: false,
    args,
  });

  const page = await browser.newPage();

  var log;
  if (debug == true) {
    await installMouseHelper(page); // Makes mouse visible

    var dir = "./htmls";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    dir = "./screenshots";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    dir = "./logs";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    log = SimpleNodeLogger.createSimpleFileLogger(opts);
    log.setLevel("info");
  }

  await page.goto(url);
  page.waitForNavigation({ waitUntil: "networkidle0" }); // Wait for page to finish loading

  // #### LOG / DEBUG
  if (debug == true) {
    log.info("1. Page loaded");
    html = await page.content();
    fs.writeFileSync(html_path + "_1_loaded_" + Math.floor(new Date() / 1000) + ".html", html);
    page.screenshot({
      path: screenshot_path + "_1_loaded_" + Math.floor(new Date() / 1000) + ".png",
    });
  }

  await page.waitFor(1000);

  await page.waitForSelector(class_names.shop_page.size_form);
  const scrollDownSizeForm = (classes) => {
    document.querySelectorAll(classes.shop_page.size_form)[0].scrollIntoView();
  };
  await page.evaluate(scrollDownSizeForm, class_names);

  // #### LOG / DEBUG
  if (debug == true) {
    log.info("2. Selectors appeared");
    html = await page.content();
    fs.writeFileSync(html_path + "_2_selectors_" + Math.floor(new Date() / 1000) + ".html", html);
    page.screenshot({
      path: screenshot_path + "_2_selectors_" + Math.floor(new Date() / 1000) + ".png",
    });
  }

  await page.waitFor(1000);

  const chooseSize = async (size, classes) => {
    const size_emts = document.querySelectorAll(classes.shop_page.sizes_fields);
    console.log("size_emts", size_emts);
    let sizes = await Array.from(size_emts);
    console.log("sizes", sizes);
    let sizeIndex = sizes.map((s, i) => (s.textContent === size ? i : false)).filter(Boolean)[0];
    console.log("sizeIndex", sizeIndex);
    return sizes[sizeIndex].click();
  };

  await page.evaluate(chooseSize, size, class_names);
  if (debug == true) {
    log.info("3. Found and clicked on size");
    html = await page.content();
    fs.writeFileSync(html_path + "_3_size_clicked__" + Math.floor(new Date() / 1000) + ".html", html);
    page.screenshot({
      path: screenshot_path + "_3_size_clicked_" + Math.floor(new Date() / 1000) + ".png",
    });
  }
  await page.waitFor(1000);

  // ADD TO CART
  await page.waitForSelector(class_names.shop_page.size_form);
  const scrollDownAddToCartButton = async (classes) => {
    const add_to_cart_button = document.querySelectorAll(classes.shop_page.add_to_cart_button)[0];
    return add_to_cart_button.scrollIntoView();
  };
  await page.evaluate(scrollDownAddToCartButton, class_names);
  if (debug == true) {
    log.info("4. Scrolled to add button");
    html = await page.content();
    fs.writeFileSync(html_path + "_4_scroll_to_add_button__" + Math.floor(new Date() / 1000) + ".html", html);
    page.screenshot({
      path: screenshot_path + "_4_scroll_to_add_button_" + Math.floor(new Date() / 1000) + ".png",
    });
  }
  await page.waitFor(1000);

  const clickAddToCartButton = async (classes) => {
    const add_to_cart_button = document.querySelectorAll(classes.shop_page.add_to_cart_button)[0];
    console.log("add_to_cart_button", add_to_cart_button);
    return add_to_cart_button.click();
  };
  await page.evaluate(clickAddToCartButton, class_names);
  if (debug == true) {
    log.info("5. Clicked add button");
    html = await page.content();
    fs.writeFileSync(html_path + "_5_clicked_add_button__" + Math.floor(new Date() / 1000) + ".html", html);
    page.screenshot({
      path: screenshot_path + "_5_clicked_add_button_" + Math.floor(new Date() / 1000) + ".png",
    });
  }
  await page.waitFor(2000);

  // CHECKOUT MODAL
  await page.waitForSelector(class_names.shop_page.checkout_modal);
  const scrollCheckoutModal = async (classes) => {
    const checkout_modal = document.querySelectorAll(classes.shop_page.checkout_modal)[0];
    return checkout_modal.scrollIntoView();
  };
  await page.evaluate(scrollCheckoutModal, class_names);
  await page.waitFor(2500);

  await page.waitForSelector(class_names.shop_page.checkout_modal);
  const clickGoToCheckoutPage = async (classes) => {
    const go_to_checkout_button = document.querySelectorAll(classes.shop_page.modal_checkout_button)[0];
    console.log("go_to_checkout_button", go_to_checkout_button);
    return go_to_checkout_button.click();
  };
  await page.evaluate(clickGoToCheckoutPage, class_names);
  await page.waitFor(500);

  page.waitForNavigation({ waitUntil: "networkidle0" }); // Wait for page to finish loading
  await page.waitFor(500);
  // CART PAGE
  await page.waitForSelector(class_names.cart_page.popover_form);
  const scrollDownCheckoutButton = async (classes) => {
    const choose_checkout_button = document.querySelectorAll(classes.cart_page.choose_checkout_button)[0];
    console.log("choose_checkout_button", choose_checkout_button, classes.cart_page.choose_checkout_button);
    return choose_checkout_button.scrollIntoView();
  };
  await page.evaluate(scrollDownCheckoutButton, class_names);
  await page.waitFor(1500);

  await page.waitForSelector(class_names.cart_page.popover_form);
  const clickCartCheckoutButton = async (classes) => {
    const choose_checkout_button = document.querySelectorAll(classes.cart_page.choose_checkout_button)[0];
    console.log("choose_checkout_button", choose_checkout_button, classes.cart_page.choose_checkout_button);
    return choose_checkout_button.click();
  };
  await page.evaluate(clickCartCheckoutButton, class_names);
  await page.waitFor(1000);

  await page.waitForSelector(class_names.cart_page.popover_form);
  const scrollDownMemberCheckoutButton = async (classes) => {
    const member_checkout_button = document.querySelectorAll(classes.cart_page.member_checkout_button)[3];
    console.log("member_checkout_button", member_checkout_button);
    return member_checkout_button.scrollIntoView();
  };
  await page.evaluate(scrollDownMemberCheckoutButton, class_names);
  await page.waitFor(1000);

  await page.waitForSelector(class_names.cart_page.popover_form);
  const clickMemberCheckoutButton = async (classes) => {
    const member_checkout_button = document.querySelectorAll(classes.cart_page.member_checkout_button)[3];
    // console.log("member_checkout_button", member_checkout_button);
    return member_checkout_button.click();
  };
  await page.evaluate(clickMemberCheckoutButton, class_names);
  await page.waitFor(2000);

  // LOGIN MODAL
  await page.waitForSelector(class_names.login_modal.login_form);
  const scrollLoginModal = async (classes) => {
    const login_form = document.querySelectorAll(classes.login_modal.login_form)[0];
    console.log("login_form", login_form);
    return login_form.scrollIntoView();
  };
  await page.evaluate(scrollLoginModal, class_names);
  await page.waitFor(1000);

  await page.waitForSelector(class_names.login_modal.email_input);
  await page.waitFor(1000);

  // Username
  await page.focus(class_names.login_modal.email_input);
  await page.keyboard.type(email);
  await page.waitFor(1000);

  // Password
  await page.focus(class_names.login_modal.password_input);
  await page.keyboard.type(pass);
  await page.waitFor(1000);

  await page.waitForSelector(class_names.login_modal.login_button);

  const clickLoginButton = async (classes) => {
    const login_button = document.querySelectorAll(classes.login_modal.login_button)[0];
    console.log("login_button", login_button);
    return login_button.click();
  };
  // Submit
  await page.evaluate(clickLoginButton, class_names);

  if (debug == true) {
    log.info("6. Logged in");
    html = await page.content();
    fs.writeFileSync(html_path + "_6_logged_in__" + Math.floor(new Date() / 1000) + ".html", html);
    page.screenshot({
      path: screenshot_path + "_6_logged_in_" + Math.floor(new Date() / 1000) + ".png",
    });
  }

  await page.waitFor(500);

  // CREDIT CARD PAGE

  page.waitForNavigation({ waitUntil: ["networkidle0", "domcontentloaded"] });
  await page.waitForSelector(class_names.credit_page.credit_page_instance);
  await page.waitFor(500);
  await page.evaluate((classes) => document.querySelectorAll(classes.credit_page.credit_page_instance)[0].scrollIntoView(), class_names);
  await page.waitFor(1500);

  // SHIPPING ADDRESS
  await page.waitForSelector(class_names.credit_page.checkbox);
  const toggleCheckbox = async (classes) => {
    const checkbox = document.querySelectorAll(classes.credit_page.checkbox)[0];
    console.log("checkbox", checkbox);
    return checkbox.click();
  };
  await page.evaluate(toggleCheckbox, class_names);
  await page.waitFor(1000);

  await page.waitForSelector(class_names.credit_page.shipping_submit);
  const confirmShippingAddress = async (classes) => {
    const shipping_submit = document.querySelectorAll(classes.credit_page.shipping_submit)[0];
    console.log("shipping_submit", shipping_submit);
    return shipping_submit.click();
  };
  await page.evaluate(confirmShippingAddress, class_names);
  await page.waitFor(1000);

  // BILLING ADDRESS
  await page.waitForSelector(class_names.credit_page.billing_submit);
  const confirmBillingAddress = async (classes) => {
    const billing_submit = document.querySelectorAll(classes.credit_page.billing_submit)[0];
    console.log("billing_submit", billing_submit);
    return billing_submit.click();
  };
  await page.evaluate(confirmBillingAddress, class_names);
  await page.waitFor(1000);

  // await page.waitForSelector(class_names.credit_page.payment_card_option);
  // const clickPaymentCardOption = async (classes) => {
  //   const payment_card_option = document.querySelectorAll(classes.credit_page.payment_card_option)[0];
  //   console.log("payment_card_option", payment_card_option);
  //   return payment_card_option.click();
  // };
  // await page.evaluate(clickPaymentCardOption, class_names);
  // await page.waitFor(500);
  // window.parent.postMessage({ childData: "test data" }, "*");
  setTimeout(async function () {
    console.log("start timout process");

    await page.waitFor(500);

    // const target_frame = page.frames().find((frame) => {
    //   console.log("frame", frame, frame.url());
    //   frame.url().includes("computop-paygate");
    // });

    const elementHandle = await page.$("iframe[id='paymentIFrame']");
    console.log("elementHandle", elementHandle);
    const target_frame = await elementHandle.contentFrame();
    console.log("target_frame", target_frame);

    await target_frame.waitFor(500);

    await target_frame.evaluate((classes) => {
      console.log("target_framedocument", document, classes.credit_page.credit_form);
      const credit_form = document.querySelectorAll(classes.credit_page.credit_form)[0];
      console.log("credit_form", credit_form);
      credit_form.scrollIntoView();
    }, class_names);
    await target_frame.waitFor(500);

    await target_frame.evaluate((classes) => document.querySelectorAll(classes.credit_page.credit_card_holder)[0].focus(), class_names);
    await target_frame.waitFor(500);
    await target_frame.type(class_names.credit_page.credit_card_holder, card_name);

    await target_frame.evaluate((classes) => document.querySelectorAll(classes.credit_page.credit_card_number_input)[0].focus(), class_names);
    await target_frame.waitFor(500);
    await target_frame.type(class_names.credit_page.credit_card_number_input, card_number);

    await target_frame.evaluate((classes) => document.querySelectorAll(classes.credit_page.expire_date_input)[0].focus(), class_names);
    await target_frame.waitFor(500);
    await target_frame.type(class_names.credit_page.expire_date_input, expire_date);

    await target_frame.evaluate((classes) => document.querySelectorAll(classes.credit_page.security_code_input)[0].focus(), class_names);
    await target_frame.waitFor(500);
    await target_frame.type(class_names.credit_page.security_code_input, cv_code);

    if (debug == true) {
      log.info("7. Entered CV");
      html = await page.content();
      fs.writeFileSync(html_path + "_7_entered_cv__" + Math.floor(new Date() / 1000) + ".html", html);
      page.screenshot({
        path: screenshot_path + "_7_entered_cv_" + Math.floor(new Date() / 1000) + ".png",
      });
    }

    await page.waitFor(1000);

    if (buy === true) {
      await target_frame.evaluate((classes) => document.querySelectorAll(classes.credit_page.place_order)[0].click(), class_names);

      if (debug == true) {
        log.info("9. Submitted Order");
        html = await page.content();
        fs.writeFileSync(html_path + "_9_submitted_order__" + Math.floor(new Date() / 1000) + ".html", html);
        page.screenshot({
          path: screenshot_path + "_9_submitted_order_" + Math.floor(new Date() / 1000) + ".png",
        });
      }

      await page.waitFor(1000);
    }
    // await browser.close();
    console.log("finished bot action");
  }, 15000);
})();
