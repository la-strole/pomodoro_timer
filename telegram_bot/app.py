"""
Telegram bot with web application pomo_dobryzhuk
"""

import os

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update, WebAppInfo
from telegram.ext import ApplicationBuilder, CallbackContext, CommandHandler


async def launch_web_ui(update: Update, callback: CallbackContext) -> None:
    """
    Launch the application with @pomo_dobryzhuk_bot
    """

    kb = [
        [
            InlineKeyboardButton(
                "Show me Pomodoro!", web_app=WebAppInfo("https://pomo.dobryzhuk.com")
            )
        ]
    ]
    await update.message.reply_text(
        "Welcome! Click the button below to get started:",
        reply_markup=InlineKeyboardMarkup(kb),
    )


if __name__ == "__main__":
    # when we run the script we want to first create the bot from the token:
    application = ApplicationBuilder().token(os.getenv("BOT_TOKEN", "")).build()

    # and let's set a command listener for /start to trigger our Web UI
    application.add_handler(CommandHandler("start", launch_web_ui))

    # and send the bot on its way!
    print(
        f"Your bot is listening! Navigate to http://t.me/{os.getenv('BOT_USERNAME','')} "
        "to interact with it!"
    )
    application.run_polling()
