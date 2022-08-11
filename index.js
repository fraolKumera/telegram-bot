const { Telegraf } = require("telegraf");
const { session } = require("telegraf");
const { Scenes } = require("telegraf");

const Cars = require("./cars");

require("dotenv").config();

let year, manufacturer, budget;

const bot = new Telegraf(process.env.BOT_ACCESS_KEY);

bot.hears("start", (ctx) => {
  ctx.reply("Hey, welcome to carBot!");
  getYear(ctx);
});

const superWizard = new Scenes.WizardScene(
  "super-wizard",
  (ctx) => {
    getYear(ctx);
    return ctx.wizard.next();
  },
  (ctx) => {
    getManufacturer(ctx);
    return ctx.wizard.next();
  },
  (ctx) => {
    getBudget(ctx);
    return ctx.wizard.next();
  },
  (ctx) => {
    getCars(ctx);
    return ctx.scene.leave();
  }
);
const stage = new Scenes.Stage([superWizard]);

bot.use(session());
bot.use(stage.middleware());
bot.command("start", (ctx) => {
  greetings(ctx);
  ctx.scene.enter("super-wizard");
});

bot.command("start", (ctx) => {
  greetings(ctx);
});

bot.command("clear", (ctx) => {
  greetings(ctx);
});

let greetings = (ctx) => {
  ctx.reply(`Hey ${ctx.from.first_name}, what's up?`);
};

let getYear = (ctx) => {
  ctx.reply(`Please tell us what model year you want your future car to be?`, {
    reply_markup: {
      keyboard: [
        ["2022", "2021", "2020", "2019"],
        ["2018", "2017", "2016", "2015"],
        ["2014", "2013", "2012", "2011"],
        ["2010", "2009", "2008", "2007"],
        ["2006", "2005", "2004", "2003"],
        ["2002", "2001", "2000"],
      ],
    },
  });
};

let getManufacturer = (ctx) => {
  year = ctx.message.text;
  ctx.reply(`Now tell us what kind of car`, {
    reply_markup: {
      keyboard: [
        ["Toyota", "Hyundai"],
        ["Nissan", "Mercedes"],
        ["Kia", "Mitsubishi"],
        ["BMW", "Land Rover"],
        ["Range Rover"],
      ],
    },
  });
};

let getBudget = (ctx) => {
  manufacturer = ctx.message.text;
  ctx.reply(`What about your budget?`, {
    reply_markup: {
      remove_keyboard: true,
    },
  });
};

let getCars = (ctx) => {
  budget = ctx.message.text;
  if (Number(budget) < 100000) {
    return ctx.reply("please enter a value greater than 100,000");
  }
  console.log(year, " ", manufacturer, " ", budget);

  const filteredCars = Cars.filter((car) => {
    return (
      car.year == year &&
      car.manufacturer == manufacturer &&
      car.price >= Number(budget) - 50000 &&
      car.price <= Number(budget) + 50000
    );
  });

  if (filteredCars.length > 0) {
    return filteredCars.map((car) => {
      ctx.replyWithPhoto(car.img, {
        caption: `Manufacturer: ${car.manufacturer}\nModel: ${
          car.model
        }\nPrice: ${car.price
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}\nYear: ${
          car.year
        }\nSeller name: ${car.seller.name}\nSeller contact : ${
          car.seller.contact
        }\nSeller address: ${car.seller.address}`,
      });
    });
  } else {
    return ctx.reply("Sorry, results cannot be found :(").then(() => {
      ctx.scene.enter("super-wizard");
    });
  }
};

bot.action("buy", (ctx) => {
  let car = Cars[0];
  ctx.reply(
    `Seller name: ${car.seller.name}\nSeller contact: ${car.seller.contact}\nSeller address: ${car.seller.address}\n\nPlease contact the seller with this address, Thank you!`
  );
});

bot.launch().then(() => console.log("Bot started Successfully"));
