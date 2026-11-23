from __future__ import annotations

import re
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class VocabularyItem(BaseModel):
    word: str
    meaning: str
    example: str


class Lesson(BaseModel):
    id: str
    level: Literal["beginner", "intermediate", "advanced"]
    title: str
    category: str
    duration: str
    prompt: str
    follow_up: str
    target_words: int
    vocabulary: list[VocabularyItem]


class EvaluationRequest(BaseModel):
    lesson_id: str
    transcript: str = Field(min_length=1, max_length=5000)


class EvaluationResponse(BaseModel):
    score: int
    word_count: int
    vocabulary_used: list[str]
    vocabulary_missing: list[str]
    strengths: list[str]
    suggestions: list[str]
    transcript: str
    scoring_note: str


class ConversationScenario(BaseModel):
    id: str
    level: Literal["beginner", "intermediate", "advanced"]
    title: str
    category: str
    description: str
    partner_name: str
    partner_role: str
    opening: str
    first_question: str
    target_phrases: list[str]
    turn_questions: list[str]


class ConversationStartResponse(BaseModel):
    scenario: ConversationScenario
    partner_message: str


class ConversationReplyRequest(BaseModel):
    turn_index: int = Field(ge=0, le=10)
    message: str = Field(min_length=1, max_length=2000)


class ConversationReplyResponse(BaseModel):
    partner_reply: str
    next_question: Optional[str]
    phrase_to_try: Optional[str]
    phrases_used: list[str]
    feedback: str
    finished: bool


LESSONS = [
    Lesson(
        id="introduce-yourself",
        level="beginner",
        title="Introduce yourself",
        category="Everyday English",
        duration="5 phút",
        prompt="Can you introduce yourself and tell me what you like doing in your free time?",
        follow_up="What is one thing you would like to learn this year?",
        target_words=30,
        vocabulary=[
            VocabularyItem(word="usually", meaning="thường thường", example="I usually read before bed."),
            VocabularyItem(word="enjoy", meaning="thích, tận hưởng", example="I enjoy spending time with friends."),
            VocabularyItem(word="interested in", meaning="quan tâm đến", example="I am interested in learning English."),
        ],
    ),
    Lesson(
        id="ordering-coffee",
        level="beginner",
        title="Ordering a coffee",
        category="Everyday English",
        duration="4 phút",
        prompt="You are at a cafe. Order a drink, choose a size, and ask how much it costs.",
        follow_up="Would you like anything to eat with your drink?",
        target_words=25,
        vocabulary=[
            VocabularyItem(word="I'd like", meaning="tôi muốn", example="I'd like a cup of tea, please."),
            VocabularyItem(word="size", meaning="kích cỡ", example="What size would you like?"),
            VocabularyItem(word="please", meaning="làm ơn", example="Could I have it without sugar, please?"),
        ],
    ),
    Lesson(
        id="daily-routine",
        level="beginner",
        title="My daily routine",
        category="Daily life",
        duration="5 phút",
        prompt="Describe a typical day. What do you do in the morning, during the day, and in the evening?",
        follow_up="What is one part of your routine you would like to change?",
        target_words=35,
        vocabulary=[
            VocabularyItem(word="wake up", meaning="thức dậy", example="I wake up at seven on weekdays."),
            VocabularyItem(word="after that", meaning="sau đó", example="After that, I have breakfast."),
            VocabularyItem(word="usually", meaning="thường thường", example="I usually take the bus to work."),
        ],
    ),
    Lesson(
        id="grocery-shopping",
        level="beginner",
        title="At the grocery store",
        category="Food & shopping",
        duration="5 phút",
        prompt="Imagine you are shopping for dinner. What ingredients do you need, and how much of each?",
        follow_up="What is your favorite meal to make at home?",
        target_words=35,
        vocabulary=[
            VocabularyItem(word="a bottle of", meaning="một chai", example="I need a bottle of water."),
            VocabularyItem(word="fresh", meaning="tươi", example="These vegetables look fresh."),
            VocabularyItem(word="how much", meaning="bao nhiêu (không đếm được)", example="How much is the rice?"),
        ],
    ),
    Lesson(
        id="asking-directions",
        level="beginner",
        title="Finding your way around",
        category="Travel",
        duration="5 phút",
        prompt="You are in a new town. Ask someone how to get to the nearest train station and check you understood.",
        follow_up="What places would you like to visit in this town?",
        target_words=35,
        vocabulary=[
            VocabularyItem(word="How do I get to", meaning="làm sao để đến", example="How do I get to the station?"),
            VocabularyItem(word="turn left", meaning="rẽ trái", example="Turn left at the traffic lights."),
            VocabularyItem(word="nearby", meaning="gần đây", example="Is there a cafe nearby?"),
        ],
    ),
    Lesson(
        id="favorite-food",
        level="beginner",
        title="Food I love",
        category="Food & culture",
        duration="5 phút",
        prompt="Talk about a dish you enjoy. Describe what it tastes like and when you usually eat it.",
        follow_up="Would you recommend this dish to a visitor? Why?",
        target_words=35,
        vocabulary=[
            VocabularyItem(word="delicious", meaning="ngon", example="My grandmother makes delicious soup."),
            VocabularyItem(word="made with", meaning="được làm từ", example="It is made with fresh herbs."),
            VocabularyItem(word="favorite", meaning="yêu thích nhất", example="Noodles are my favorite comfort food."),
        ],
    ),
    Lesson(
        id="weekend-plans",
        level="intermediate",
        title="Talk about your weekend",
        category="Daily life",
        duration="6 phút",
        prompt="Describe a memorable weekend. What did you do, who were you with, and why did you enjoy it?",
        follow_up="If you had an extra day off, how would you spend it?",
        target_words=55,
        vocabulary=[
            VocabularyItem(word="memorable", meaning="đáng nhớ", example="It was a memorable trip."),
            VocabularyItem(word="although", meaning="mặc dù", example="Although it rained, we had fun."),
            VocabularyItem(word="recommend", meaning="đề xuất, giới thiệu", example="I would recommend that place to anyone."),
        ],
    ),
    Lesson(
        id="healthy-habits",
        level="intermediate",
        title="Healthy habits",
        category="Lifestyle",
        duration="7 phút",
        prompt="What healthy habits have you tried? Explain which ones work best for you and why.",
        follow_up="What advice would you give a friend who wants to feel healthier?",
        target_words=55,
        vocabulary=[
            VocabularyItem(word="habit", meaning="thói quen", example="Walking every day is a healthy habit."),
            VocabularyItem(word="benefit", meaning="lợi ích", example="One benefit is that I sleep better."),
            VocabularyItem(word="consistent", meaning="kiên trì, đều đặn", example="It is important to be consistent."),
        ],
    ),
    Lesson(
        id="travel-memory",
        level="intermediate",
        title="A trip to remember",
        category="Travel",
        duration="6 phút",
        prompt="Describe a trip you enjoyed. Explain what you saw, what surprised you, and what you learned.",
        follow_up="What would you do differently if you visited again?",
        target_words=60,
        vocabulary=[
            VocabularyItem(word="breathtaking", meaning="đẹp ngoạn mục", example="The view from the mountain was breathtaking."),
            VocabularyItem(word="unexpected", meaning="không ngờ tới", example="We had an unexpected delay at the airport."),
            VocabularyItem(word="local", meaning="địa phương", example="We tried some local food."),
        ],
    ),
    Lesson(
        id="recommend-a-movie",
        level="intermediate",
        title="Recommend a movie or book",
        category="Entertainment",
        duration="6 phút",
        prompt="Recommend a movie or book to a friend. Describe what it is about without giving away the ending.",
        follow_up="What kind of person do you think would enjoy it?",
        target_words=60,
        vocabulary=[
            VocabularyItem(word="storyline", meaning="cốt truyện", example="The storyline kept me interested."),
            VocabularyItem(word="character", meaning="nhân vật", example="The main character feels very real."),
            VocabularyItem(word="worth watching", meaning="đáng xem", example="It is definitely worth watching."),
        ],
    ),
    Lesson(
        id="learning-something-new",
        level="intermediate",
        title="Learning a new skill",
        category="Learning & goals",
        duration="6 phút",
        prompt="Talk about a skill you are learning or would like to learn. What makes it challenging, and how will you practice?",
        follow_up="How will you know you are making progress?",
        target_words=60,
        vocabulary=[
            VocabularyItem(word="set a goal", meaning="đặt mục tiêu", example="I set a goal to practice three times a week."),
            VocabularyItem(word="make progress", meaning="tiến bộ", example="I can make progress with regular practice."),
            VocabularyItem(word="challenging", meaning="đầy thử thách", example="Pronunciation is challenging for me."),
        ],
    ),
    Lesson(
        id="solving-a-travel-problem",
        level="intermediate",
        title="Solving a travel problem",
        category="Travel & problem solving",
        duration="7 phút",
        prompt="Your hotel room is not what you booked. Explain the problem politely and ask the staff to help.",
        follow_up="What would you say if the first solution did not work?",
        target_words=60,
        vocabulary=[
            VocabularyItem(word="reservation", meaning="đặt chỗ", example="I have a reservation under my name."),
            VocabularyItem(word="instead", meaning="thay vào đó", example="Could I have a different room instead?"),
            VocabularyItem(word="would it be possible", meaning="liệu có thể", example="Would it be possible to change rooms?"),
        ],
    ),
    Lesson(
        id="technology-and-work",
        level="advanced",
        title="Technology and the future of work",
        category="Ideas & society",
        duration="8 phút",
        prompt="How is technology changing the way people work? Discuss both the opportunities and the challenges.",
        follow_up="What skills will be most valuable for workers in the next decade?",
        target_words=85,
        vocabulary=[
            VocabularyItem(word="automation", meaning="tự động hóa", example="Automation can save teams a lot of time."),
            VocabularyItem(word="whereas", meaning="trong khi đó", example="Some roles are growing, whereas others are changing."),
            VocabularyItem(word="adapt", meaning="thích nghi", example="Workers need to adapt to new tools."),
        ],
    ),
    Lesson(
        id="city-life",
        level="advanced",
        title="Rethinking city life",
        category="Ideas & society",
        duration="8 phút",
        prompt="What makes a city a good place to live? Weigh convenience against issues like cost, noise, and the environment.",
        follow_up="If you could change one thing about your city, what would it be?",
        target_words=85,
        vocabulary=[
            VocabularyItem(word="sustainable", meaning="bền vững", example="Cities need more sustainable transport."),
            VocabularyItem(word="infrastructure", meaning="cơ sở hạ tầng", example="Reliable infrastructure benefits everyone."),
            VocabularyItem(word="nevertheless", meaning="tuy nhiên", example="City life is expensive; nevertheless, many people prefer it."),
        ],
    ),
    Lesson(
        id="social-media",
        level="advanced",
        title="The influence of social media",
        category="Technology & society",
        duration="8 phút",
        prompt="How does social media affect the way people communicate and get information? Consider both benefits and drawbacks.",
        follow_up="What responsibilities should platforms have toward their users?",
        target_words=90,
        vocabulary=[
            VocabularyItem(word="influence", meaning="ảnh hưởng", example="Social media has a strong influence on trends."),
            VocabularyItem(word="misinformation", meaning="thông tin sai lệch", example="Misinformation can spread very quickly."),
            VocabularyItem(word="on the other hand", meaning="mặt khác", example="It connects people; on the other hand, it can be distracting."),
        ],
    ),
    Lesson(
        id="environmental-choices",
        level="advanced",
        title="Everyday choices and the environment",
        category="Environment",
        duration="8 phút",
        prompt="How much difference can individual choices make to the environment? Discuss personal habits and wider responsibilities.",
        follow_up="Which change would be realistic for your community to make?",
        target_words=90,
        vocabulary=[
            VocabularyItem(word="carbon footprint", meaning="lượng khí thải carbon", example="Taking the train can reduce your carbon footprint."),
            VocabularyItem(word="trade-off", meaning="sự đánh đổi", example="There is often a trade-off between cost and convenience."),
            VocabularyItem(word="collective action", meaning="hành động tập thể", example="Collective action can bring wider change."),
        ],
    ),
    Lesson(
        id="cultural-traditions",
        level="advanced",
        title="Keeping traditions alive",
        category="Culture & identity",
        duration="8 phút",
        prompt="Choose a tradition that matters to you or your community. How has it changed, and why is it worth preserving?",
        follow_up="How can younger generations make a tradition their own?",
        target_words=90,
        vocabulary=[
            VocabularyItem(word="heritage", meaning="di sản", example="Food is an important part of our cultural heritage."),
            VocabularyItem(word="pass down", meaning="truyền lại", example="Stories are passed down through generations."),
            VocabularyItem(word="evolve", meaning="phát triển, biến đổi", example="Traditions evolve as society changes."),
        ],
    ),
    Lesson(
        id="work-life-balance",
        level="advanced",
        title="What does work-life balance mean?",
        category="Work & society",
        duration="8 phút",
        prompt="What does a healthy work-life balance look like? Discuss how employers and individuals can support it.",
        follow_up="Should flexible working be a standard option? Explain your view.",
        target_words=90,
        vocabulary=[
            VocabularyItem(word="boundaries", meaning="ranh giới", example="Clear boundaries help people disconnect from work."),
            VocabularyItem(word="well-being", meaning="sức khỏe và hạnh phúc", example="Rest is essential for employee well-being."),
            VocabularyItem(word="sustainable pace", meaning="nhịp độ bền vững", example="Teams do better at a sustainable pace."),
        ],
    ),
]

CONVERSATIONS = [
    ConversationScenario(
        id="coffee-shop",
        level="beginner",
        title="At a coffee shop",
        category="Everyday English",
        description="Order a drink, make a small request, and enjoy a friendly chat with the barista.",
        partner_name="Alex",
        partner_role="friendly barista",
        opening="Hi there! Welcome in. What can I get started for you?",
        first_question="What would you like to drink today?",
        target_phrases=["I'd like...", "Could I have...?", "That sounds great."],
        turn_questions=[
            "Nice choice! Would you like that hot or iced, and what size?",
            "Sure thing. Would you like to add anything to eat?",
            "No problem! Is that for here or to go?",
            "Perfect, I have that for you. How is your day going so far?",
        ],
    ),
    ConversationScenario(
        id="taking-the-bus",
        level="beginner",
        title="Taking the bus",
        category="Getting around",
        description="Ask whether the bus goes to the city center, buy a ticket, and find out where to get off.",
        partner_name="Sam",
        partner_role="helpful bus driver",
        opening="Good morning! Where are you heading today?",
        first_question="Are you going to the city center?",
        target_phrases=["Does this bus go to...?", "Where should I get off?", "How much is a ticket?"],
        turn_questions=[
            "Yes, it does. Do you already have a ticket?",
            "You can pay on board. Would you like a single or return ticket?",
            "The journey takes about twenty minutes. Do you know which stop you need?",
            "I'll let you know when we get there. Have you visited the city before?",
        ],
    ),
    ConversationScenario(
        id="at-the-market",
        level="beginner",
        title="Shopping at the market",
        category="Shopping & food",
        description="Buy fresh fruit, ask about prices, and make a friendly request at a local market.",
        partner_name="Taylor",
        partner_role="market stall owner",
        opening="Morning! The strawberries are lovely today. Can I help you find anything?",
        first_question="What would you like to buy?",
        target_phrases=["How much are these?", "Could I have...", "That's all, thank you."],
        turn_questions=[
            "Good choice! How many would you like?",
            "Of course. Would you like anything else today?",
            "That comes to five dollars. Would you like a bag?",
            "There you go! Are you making something special with these?",
        ],
    ),
    ConversationScenario(
        id="meeting-a-neighbor",
        level="beginner",
        title="Meeting a new neighbor",
        category="Neighbors & community",
        description="Introduce yourself to a neighbor, make small talk, and ask about the neighborhood.",
        partner_name="Riley",
        partner_role="your new neighbor",
        opening="Hi! You must be new in the building. I'm Riley from next door.",
        first_question="How are you settling in so far?",
        target_phrases=["I just moved in.", "It's nice to meet you.", "Is there a good place to... nearby?"],
        turn_questions=[
            "Welcome to the neighborhood! Where did you move from?",
            "Oh, nice! Have you found everything you need around here?",
            "There's a great little shop just around the corner. What do you like doing on weekends?",
            "That sounds fun. Let me know if you ever need a hand with anything.",
        ],
    ),
    ConversationScenario(
        id="asking-for-directions",
        level="beginner",
        title="Asking for directions",
        category="Getting around",
        description="Ask a passerby how to reach a nearby place and check that you understood the directions.",
        partner_name="Pat",
        partner_role="a helpful passerby",
        opening="Hi there. You look like you're trying to find something. Can I help?",
        first_question="Where are you trying to go?",
        target_phrases=["How do I get to...?", "Is it far from here?", "Thanks for your help."],
        turn_questions=[
            "The library? Go straight for two blocks. Does that make sense?",
            "It's about a ten-minute walk. Would you like me to point it out on the map?",
            "Turn left at the traffic lights. Do you know where those are?",
            "You're welcome! Is there anything else you need?",
        ],
    ),
    ConversationScenario(
        id="at-the-pharmacy",
        level="beginner",
        title="At the pharmacy",
        category="Health & errands",
        description="Explain a simple health concern, ask the pharmacist for help, and check how to use a product.",
        partner_name="Robin",
        partner_role="a pharmacist",
        opening="Hello! Welcome. What can I help you with today?",
        first_question="What are you looking for?",
        target_phrases=["I have a...", "Could you help me find...?", "How should I use it?"],
        turn_questions=[
            "I can help you find something for that. How long have you had the symptoms?",
            "Do you have any allergies I should know about?",
            "I'll show you the instructions on the package. Would you like me to explain them?",
            "Of course. If you're unsure or the symptoms continue, please check with a doctor. Anything else?",
        ],
    ),
    ConversationScenario(
        id="calling-a-repair-service",
        level="beginner",
        title="Calling a repair service",
        category="Home & services",
        description="Report a household problem, describe when it started, and arrange a convenient visit.",
        partner_name="Dana",
        partner_role="a repair service receptionist",
        opening="Good morning, QuickFix Repairs. How can I help you?",
        first_question="What seems to be the problem?",
        target_phrases=["The ... isn't working.", "It started...", "Could someone come...?"],
        turn_questions=[
            "I'm sorry to hear that. When did the problem start?",
            "Thanks for explaining. Is the appliance still safe to use?",
            "We can send someone tomorrow morning. Would that work for you?",
            "Great, I have your address. Is there anything else I should note?",
        ],
    ),
    ConversationScenario(
        id="meeting-a-new-coworker",
        level="beginner",
        title="Meeting a new coworker",
        category="Workplace basics",
        description="Introduce yourself to a new teammate and make friendly small talk on their first day.",
        partner_name="Taylor",
        partner_role="your new coworker",
        opening="Hi! You must be new to the team. I'm Taylor. Nice to meet you!",
        first_question="What team will you be working with?",
        target_phrases=["Nice to meet you.", "I'll be working with...", "How long have you worked here?"],
        turn_questions=[
            "Welcome aboard! What kind of work will you be doing?",
            "That sounds interesting. Have you met the rest of the team yet?",
            "I've been here for about a year. How has your first morning been?",
            "Let me know if you need anything while you're settling in.",
        ],
    ),
    ConversationScenario(
        id="finding-things-at-work",
        level="beginner",
        title="Finding your way around the office",
        category="Workplace basics",
        description="Ask a coworker where to find common office spaces and confirm the directions.",
        partner_name="Jamie",
        partner_role="your coworker",
        opening="Hey! You look like you're looking for something. Can I help?",
        first_question="What are you trying to find?",
        target_phrases=["Where is the...?", "How do I get there?", "Thanks for showing me."],
        turn_questions=[
            "The meeting room is down the hall. Do you know where the kitchen is?",
            "The printer is next to the front desk. Would you like me to show you?",
            "No problem! Are you joining the team meeting now?",
            "You're welcome. Let me know if you need help with anything else.",
        ],
    ),
    ConversationScenario(
        id="picking-up-a-package",
        level="beginner",
        title="Picking up a package",
        category="Everyday errands",
        description="Collect a parcel from a service desk, show identification, and ask about the pickup process.",
        partner_name="Alex",
        partner_role="a service desk assistant",
        opening="Hello! How can I help you today?",
        first_question="Are you here to pick up a package?",
        target_phrases=["I'm here to pick up...", "Could you check for...?", "Here is my ID."],
        turn_questions=[
            "Sure. What's the name on the package?",
            "I found it. Could I see a photo ID, please?",
            "Thanks. Would you like to check that everything is there?",
            "All set! Is there anything else I can help you with?",
        ],
    ),
    ConversationScenario(
        id="meeting-a-friend",
        level="intermediate",
        title="Meeting someone new",
        category="Social life",
        description="Keep a conversation going, talk about your interests, and find something you have in common.",
        partner_name="Jamie",
        partner_role="someone you just met",
        opening="Hey, I don't think we've met before. I'm Jamie. How do you know the host?",
        first_question="So, what do you like doing when you have some free time?",
        target_phrases=["I'm really into...", "What about you?", "We have that in common."],
        turn_questions=[
            "That sounds fun! How did you get into it?",
            "I love hearing about that. Do you usually do it on your own or with friends?",
            "Nice! Is there anything new you'd like to try next?",
            "That sounds like a great plan. Do you have any recommendations for me?",
        ],
    ),
    ConversationScenario(
        id="doctor-appointment",
        level="intermediate",
        title="At the doctor's office",
        category="Health & appointments",
        description="Explain how you have been feeling, answer a few questions, and ask what to do next.",
        partner_name="Jordan",
        partner_role="your doctor",
        opening="Hello, come on in. What brings you in today?",
        first_question="Can you tell me how long you have been feeling this way?",
        target_phrases=["I've been feeling...", "It started about...", "What would you recommend?"],
        turn_questions=[
            "I see. Have you noticed anything that makes it feel better or worse?",
            "Thanks for explaining that. Are you taking any medication at the moment?",
            "All right. I'll check a few things. Do you have any questions for me?",
            "Let's try that and check in again next week. Does that work for you?",
        ],
    ),
    ConversationScenario(
        id="making-weekend-plans",
        level="intermediate",
        title="Making weekend plans",
        category="Friends & free time",
        description="Suggest an activity, find a time that works, and make a plan with a friend.",
        partner_name="Casey",
        partner_role="your friend",
        opening="Hey! We haven't caught up in ages. Are you free to do something this weekend?",
        first_question="What would you feel like doing?",
        target_phrases=["How about...?", "That works for me.", "Let's meet at..."],
        turn_questions=[
            "That sounds like fun! What day works better for you?",
            "Saturday afternoon works for me. What time were you thinking?",
            "Great. Where should we meet?",
            "Perfect, it's a plan! Should we invite anyone else?",
        ],
    ),
    ConversationScenario(
        id="booking-an-appointment",
        level="intermediate",
        title="Booking an appointment",
        category="Phone calls & services",
        description="Call a salon to book a time, ask about availability, and confirm the details.",
        partner_name="Avery",
        partner_role="salon receptionist",
        opening="Hello, Green Street Salon. How can I help you?",
        first_question="What kind of appointment would you like to book?",
        target_phrases=["I'd like to book...", "Do you have anything available...?", "Could you confirm..."],
        turn_questions=[
            "Of course. Do you have a day or time in mind?",
            "We have an opening at three o'clock. Would that suit you?",
            "Great. Could I take your name and phone number, please?",
            "You're all booked for Thursday at three. Is there anything else I can help with?",
        ],
    ),
    ConversationScenario(
        id="booking-a-restaurant-table",
        level="intermediate",
        title="Booking a restaurant table",
        category="Dining out",
        description="Call a restaurant, request a table for a particular time, and ask about seating preferences.",
        partner_name="Casey",
        partner_role="a restaurant host",
        opening="Good afternoon, Olive Tree Restaurant. How can I help?",
        first_question="What day and time would you like to book?",
        target_phrases=["I'd like to make a reservation.", "Do you have a table for...?", "Could we sit...?"],
        turn_questions=[
            "We have a table at seven. How many people will be joining you?",
            "Would you prefer a table inside or outside?",
            "Certainly. Could I have a name and a phone number for the booking?",
            "You're booked for Friday at seven. Would you like to know anything about the menu?",
        ],
    ),
    ConversationScenario(
        id="changing-a-travel-booking",
        level="intermediate",
        title="Changing a travel booking",
        category="Travel & services",
        description="Contact a travel agent to change a reservation and compare available options.",
        partner_name="Morgan",
        partner_role="a travel agent",
        opening="Hello, City Travel. How can I assist you with your booking?",
        first_question="What would you like to change about your trip?",
        target_phrases=["I need to change...", "Is there another option?", "What would the fee be?"],
        turn_questions=[
            "I can look into that. What date would you prefer instead?",
            "There's a later flight available. Would you like me to check the price difference?",
            "The change fee is twenty dollars. Would you like to go ahead?",
            "I've updated your booking. Would you like me to send the details by email?",
        ],
    ),
    ConversationScenario(
        id="reporting-a-delivery-problem",
        level="intermediate",
        title="Reporting a delivery problem",
        category="Shopping & services",
        description="Contact customer service about a late or incomplete delivery and agree on a next step.",
        partner_name="Riley",
        partner_role="a customer service representative",
        opening="Thanks for calling ShopDirect support. How can I help today?",
        first_question="Could you tell me what's happened with your order?",
        target_phrases=["My order was supposed to...", "I haven't received...", "Could you look into it?"],
        turn_questions=[
            "I'm sorry about that. Do you have your order number?",
            "I can see the tracking information. When did you last receive an update?",
            "We can send the missing item again. Would that solve the problem?",
            "I'll arrange that now and email you the details. Is there anything else?",
        ],
    ),
    ConversationScenario(
        id="asking-a-colleague-for-help",
        level="intermediate",
        title="Asking a colleague for help",
        category="Teamwork",
        description="Explain where you are stuck on a task, ask a colleague for guidance, and agree on a way to work together.",
        partner_name="Jordan",
        partner_role="your teammate",
        opening="Hey, how's the new report going? You look like you might have a question.",
        first_question="Which part would you like a hand with?",
        target_phrases=["Could I get your input on...?", "I'm having trouble with...", "Would you have time to...?"],
        turn_questions=[
            "I see. What have you tried so far?",
            "I can take a look after lunch. What have you found out already?",
            "That should help. Would it be useful if we worked through one example together?",
            "Great, let's check in again this afternoon. Does that work for you?",
        ],
    ),
    ConversationScenario(
        id="giving-a-project-update",
        level="intermediate",
        title="Giving a project update",
        category="Team meetings",
        description="Share a concise progress update, mention a challenge, and explain what the team will do next.",
        partner_name="Avery",
        partner_role="your meeting facilitator",
        opening="Let's go around the team with quick project updates. How is your part coming along?",
        first_question="What have you completed since our last meeting?",
        target_phrases=["Since our last meeting...", "We're on track to...", "The main challenge is..."],
        turn_questions=[
            "Good progress. Is anything blocking the next step?",
            "What support would help you move forward?",
            "When do you expect to have that ready?",
            "Thanks for the update. Is there anything else the team should know?",
        ],
    ),
    ConversationScenario(
        id="agreeing-on-team-priorities",
        level="intermediate",
        title="Agreeing on team priorities",
        category="Team meetings",
        description="Discuss competing tasks with coworkers and agree on what the team should focus on first.",
        partner_name="Sam",
        partner_role="your project teammate",
        opening="We have a few important tasks this week. Which one do you think we should tackle first?",
        first_question="What makes that task the highest priority for you?",
        target_phrases=["I suggest we prioritize...", "The reason is...", "Would you be open to...?"],
        turn_questions=[
            "That makes sense. What might happen if we delay the other task?",
            "How much time do you think the first task will take?",
            "Could we split the work to make progress on both?",
            "Sounds like we have a plan. Who should take the first step?",
        ],
    ),
    ConversationScenario(
        id="workplace-small-talk",
        level="advanced",
        title="A conversation at work",
        category="Work & career",
        description="Chat naturally with a colleague about a project, share your perspective, and ask thoughtful questions.",
        partner_name="Morgan",
        partner_role="your colleague",
        opening="Hi! I heard your team has been working on the new project. How's it going so far?",
        first_question="What part of the project has been the most interesting for you?",
        target_phrases=["One thing I've noticed is...", "From my perspective...", "How about your team?"],
        turn_questions=[
            "That makes sense. What has been the biggest challenge?",
            "Interesting. How did your team decide what to focus on first?",
            "I can see how that would help. What's the next step?",
            "Sounds like good progress. Is there anything you'd change if you started over?",
        ],
    ),
    ConversationScenario(
        id="returning-an-item",
        level="advanced",
        title="Returning something to a store",
        category="Shopping & customer service",
        description="Explain why an item did not work out, ask about the return policy, and agree on a solution.",
        partner_name="Drew",
        partner_role="customer service assistant",
        opening="Hi there. How can I help you with your purchase today?",
        first_question="Could you tell me what's wrong with the item?",
        target_phrases=["I was hoping to...", "Would it be possible to...?", "I appreciate your help."],
        turn_questions=[
            "I'm sorry about that. Do you have the receipt with you?",
            "Thanks. Would you prefer an exchange or a refund?",
            "We can exchange it for another one. Would that work for you?",
            "Great, I'll take care of that now. Is there anything else I can do?",
        ],
    ),
    ConversationScenario(
        id="talking-to-a-landlord",
        level="advanced",
        title="Talking to your landlord",
        category="Home & renting",
        description="Raise an issue with your apartment, explain its impact, and agree on a practical next step.",
        partner_name="Chris",
        partner_role="your landlord",
        opening="Hi, thanks for calling. How is everything going in the apartment?",
        first_question="You mentioned there was an issue. Could you tell me a bit more?",
        target_phrases=["I've noticed that...", "Would you be able to...", "When would be a convenient time?"],
        turn_questions=[
            "I understand. When did you first notice the problem?",
            "Thanks for letting me know. Has it caused any damage?",
            "I'll arrange for someone to take a look. What time are you usually home?",
            "I'll confirm the visit by message. Does that sound all right?",
        ],
    ),
    ConversationScenario(
        id="resolving-a-noisy-neighbor-issue",
        level="advanced",
        title="Talking about a noise problem",
        category="Neighbors & community",
        description="Politely discuss a recurring noise issue with a neighbor and look for a solution together.",
        partner_name="Lee",
        partner_role="your neighbor",
        opening="Hey, good to see you. Is everything okay?",
        first_question="You wanted to talk about something?",
        target_phrases=["I wanted to mention...", "Would you mind...?", "I understand, thanks for..."],
        turn_questions=[
            "Oh, I didn't realize it was carrying that far. When is it most noticeable?",
            "I understand. Would it help if I kept the music down after a certain time?",
            "That sounds fair. Is there anything else we could do to make it easier?",
            "Thanks for bringing it up kindly. I'll be more mindful from now on.",
        ],
    ),
    ConversationScenario(
        id="negotiating-a-lease-renewal",
        level="advanced",
        title="Discussing a lease renewal",
        category="Home & renting",
        description="Discuss renewal terms with your landlord, ask about a proposed rent change, and explore options.",
        partner_name="Chris",
        partner_role="your landlord",
        opening="Hi, thanks for meeting with me. Your lease is coming up for renewal. Have you had a chance to review the terms?",
        first_question="What would you like to discuss about the renewal?",
        target_phrases=["I'd like to discuss...", "Would you consider...?", "Could we agree on...?"],
        turn_questions=[
            "I understand your concern. What terms would work better for you?",
            "I can consider that. How long are you hoping to renew for?",
            "Would a longer lease make the proposed terms more workable?",
            "Let me review the options and get back to you. When would you need an answer?",
        ],
    ),
    ConversationScenario(
        id="resolving-a-utility-billing-issue",
        level="advanced",
        title="Resolving a utility billing issue",
        category="Home & services",
        description="Explain a discrepancy on a household bill, request clarification, and agree on how it will be reviewed.",
        partner_name="Dana",
        partner_role="a utility company representative",
        opening="Thank you for calling City Utilities. How can I help with your account?",
        first_question="Could you explain what seems incorrect on the bill?",
        target_phrases=["I noticed a discrepancy in...", "Could you clarify how...?", "I'd appreciate a review of..."],
        turn_questions=[
            "I can look into that. Which charge are you referring to?",
            "The charge is based on the latest meter reading. Would you like me to compare it with the previous bill?",
            "I can submit a review request. Do you have any supporting information to share?",
            "I've submitted the request, and we'll contact you within three business days. Does that address your concern?",
        ],
    ),
    ConversationScenario(
        id="leading-a-project-kickoff",
        level="advanced",
        title="Leading a project kickoff meeting",
        category="Team meetings",
        description="Open a project meeting, clarify the shared goal, invite input, and align the team on immediate actions.",
        partner_name="Morgan",
        partner_role="your project teammate",
        opening="Thanks, everyone, for joining. Before we begin, could you share what success would look like for this project?",
        first_question="What outcome should we make sure to deliver?",
        target_phrases=["The goal for today is...", "Let's make sure we're aligned on...", "What are your thoughts on...?"],
        turn_questions=[
            "That's helpful. What would be a realistic first milestone?",
            "Which risks should we keep in mind from the start?",
            "Who should own each of those next steps?",
            "Before we wrap up, is there anything we haven't covered?",
        ],
    ),
    ConversationScenario(
        id="discussing-a-project-deadline",
        level="advanced",
        title="Discussing a project deadline",
        category="Project planning",
        description="Raise a delivery risk with a manager, explain the trade-offs, and propose a realistic adjustment.",
        partner_name="Alex",
        partner_role="your project manager",
        opening="I saw your note about the delivery date. Can you walk me through the situation?",
        first_question="What is putting the current deadline at risk?",
        target_phrases=["Based on the current scope...", "One option would be to...", "To maintain quality, we'd need..."],
        turn_questions=[
            "Which parts of the scope are essential for the first release?",
            "What would the impact be if we moved the date by a week?",
            "Could we deliver a smaller first version and follow up with the remaining work?",
            "What do you recommend we communicate to the stakeholders?",
        ],
    ),
    ConversationScenario(
        id="handling-a-meeting-disagreement",
        level="advanced",
        title="Handling a disagreement in a meeting",
        category="Team collaboration",
        description="Respond constructively to a different opinion, clarify each perspective, and work toward a shared decision.",
        partner_name="Casey",
        partner_role="your coworker",
        opening="I understand your proposal, but I'm not sure it addresses the main concern. Could we talk it through?",
        first_question="Which part do you see differently?",
        target_phrases=["I see your point, and...", "Could we look at the trade-offs?", "Is there a compromise that...?"],
        turn_questions=[
            "That's a fair concern. What evidence would help us compare the options?",
            "I hadn't considered that impact. How would your approach handle it?",
            "Could we test both ideas on a small scale before deciding?",
            "That seems like a reasonable next step. Are you comfortable with that?",
        ],
    ),
    ConversationScenario(
        id="presenting-a-proposal-to-the-team",
        level="advanced",
        title="Presenting a proposal to the team",
        category="Team meetings",
        description="Present a recommendation to coworkers, explain its rationale, and respond to questions and feedback.",
        partner_name="Riley",
        partner_role="a coworker reviewing your proposal",
        opening="Thanks for sharing your proposal. Could you start by explaining the problem it is intended to solve?",
        first_question="What led you to recommend this approach?",
        target_phrases=["The main benefit is...", "One trade-off to consider is...", "I'm open to feedback on..."],
        turn_questions=[
            "How would you measure whether the approach is working?",
            "What risks do you anticipate during implementation?",
            "How does this compare with the other option we discussed?",
            "What feedback would be most useful before you finalize it?",
        ],
    ),
]

CONVERSATIONS.extend(
    [
        ConversationScenario(
            id="ordering-at-a-bakery",
            level="beginner",
            title="Ordering at a bakery",
            category="Everyday errands",
            description="Choose something from a bakery, ask about ingredients, and place a simple order.",
            partner_name="Alex",
            partner_role="a bakery assistant",
            opening="Good morning! Everything was baked fresh today. What can I get for you?",
            first_question="Would you like something sweet or savory?",
            target_phrases=["Could I have...?", "Does this contain...?", "That's everything, thank you."],
            turn_questions=[
                "The cinnamon roll is very popular. Would you like one?",
                "This one has nuts, but I can show you a nut-free option. Would that help?",
                "Would you like anything to drink with that?",
                "Of course. Would you like a bag for your order?",
            ],
        ),
        ConversationScenario(
            id="checking-into-a-hotel",
            level="beginner",
            title="Checking into a hotel",
            category="Travel",
            description="Check in at a hotel, confirm your reservation, and ask about basic facilities.",
            partner_name="Jordan",
            partner_role="a hotel receptionist",
            opening="Welcome to the Riverside Hotel. Do you have a reservation with us?",
            first_question="Could I have the name on the booking?",
            target_phrases=["I have a reservation under...", "What time is breakfast?", "Could you tell me where...?"],
            turn_questions=[
                "I found your booking. Could I see your ID, please?",
                "You're staying for two nights. Would you like one key or two?",
                "Breakfast is served from seven to ten. Would you like directions to the elevator?",
                "You're all set. Is there anything else you need for your stay?",
            ],
        ),
        ConversationScenario(
            id="buying-a-train-ticket",
            level="beginner",
            title="Buying a train ticket",
            category="Getting around",
            description="Buy a ticket at the station and ask about departure times and platform information.",
            partner_name="Sam",
            partner_role="a ticket clerk",
            opening="Hello! Where would you like to travel today?",
            first_question="What time would you like to leave?",
            target_phrases=["I'd like a ticket to...", "What time does it leave?", "Which platform is it?"],
            turn_questions=[
                "There's a train at ten fifteen. Would you like that one?",
                "Would you like a single or a return ticket?",
                "It leaves from platform four. Do you need help finding it?",
                "Have a good trip! Is there anything else I can help you with?",
            ],
        ),
        ConversationScenario(
            id="booking-a-hair-appointment",
            level="beginner",
            title="Booking a hair appointment",
            category="Appointments & services",
            description="Call a hair salon, ask for an available time, and confirm a simple appointment.",
            partner_name="Riley",
            partner_role="a salon receptionist",
            opening="Hello, Bright Hair Salon. How can I help you?",
            first_question="What would you like to book?",
            target_phrases=["I'd like to book...", "Do you have time on...?", "Could you repeat that, please?"],
            turn_questions=[
                "We offer cuts and styling. Which would you like?",
                "We have an opening on Thursday afternoon. What time works for you?",
                "I have you down for Thursday at three. Could I have your name?",
                "Thanks, you're booked. Would you like a reminder by text?",
            ],
        ),
        ConversationScenario(
            id="returning-library-books",
            level="beginner",
            title="Returning books to the library",
            category="Community & learning",
            description="Return borrowed books, ask about the due date, and find out how to borrow another one.",
            partner_name="Casey",
            partner_role="a librarian",
            opening="Hi! Are you returning these books today?",
            first_question="Would you like to renew any of them?",
            target_phrases=["I'd like to return these.", "When is it due?", "Can I borrow... next?"],
            turn_questions=[
                "Sure. This one is due next week. Would you like to keep it longer?",
                "You can renew it online or here at the desk. Which would you prefer?",
                "The new books are on the table by the window. What kind of book are you looking for?",
                "I can help you find one. Do you need anything else today?",
            ],
        ),
        ConversationScenario(
            id="asking-for-help-in-a-store",
            level="beginner",
            title="Asking for help in a store",
            category="Shopping",
            description="Ask a shop assistant where an item is, check its price, and ask about another size or color.",
            partner_name="Taylor",
            partner_role="a shop assistant",
            opening="Hello! Let me know if you need help finding anything.",
            first_question="What are you looking for today?",
            target_phrases=["Where can I find...?", "How much is this?", "Do you have it in... ?"],
            turn_questions=[
                "You'll find those in aisle three. What size do you need?",
                "That one costs twenty dollars. Would you like to try it?",
                "We have it in blue and green. Which color do you prefer?",
                "The fitting room is just over there. Can I help you with anything else?",
            ],
        ),
        ConversationScenario(
            id="chatting-about-the-weather",
            level="beginner",
            title="Making small talk about the weather",
            category="Neighbors & community",
            description="Make friendly small talk with a neighbor and share simple plans for the day.",
            partner_name="Lee",
            partner_role="your neighbor",
            opening="Morning! It's finally sunny after all that rain, isn't it?",
            first_question="Do you have any plans to enjoy the nice weather?",
            target_phrases=["It looks like...", "I'm hoping to...", "How about you?"],
            turn_questions=[
                "That sounds nice. Do you usually go there on weekends?",
                "I might take a walk later. Is there a good park nearby?",
                "The one by the river is lovely. Would you recommend the walking path?",
                "Thanks for the tip. Enjoy the rest of your day!",
            ],
        ),
        ConversationScenario(
            id="borrowing-office-supplies",
            level="beginner",
            title="Borrowing office supplies",
            category="Workplace basics",
            description="Ask a coworker to borrow a common office item and offer to return it.",
            partner_name="Morgan",
            partner_role="your coworker",
            opening="Hi! Do you need something from the supply cabinet?",
            first_question="What are you looking for?",
            target_phrases=["Could I borrow...?", "Where can I find...?", "I'll bring it back."],
            turn_questions=[
                "Sure, take my stapler. Do you need anything else?",
                "The paper is in the cabinet by the printer. Can you find it?",
                "No problem. Just leave it on my desk when you're done.",
                "You're welcome! Are you getting ready for the team meeting?",
            ],
        ),
        ConversationScenario(
            id="asking-about-work-schedule",
            level="beginner",
            title="Asking about your work schedule",
            category="Workplace basics",
            description="Check your work hours with a supervisor and clarify when and where to start.",
            partner_name="Avery",
            partner_role="your supervisor",
            opening="Hi! Are you all set for your first shift this week?",
            first_question="Is there anything about the schedule you'd like to check?",
            target_phrases=["What time do I start?", "Am I working on...?", "Where should I check in?"],
            turn_questions=[
                "Your shift starts at nine. Would you like me to show you where to sign in?",
                "You're on the morning team this week. Is that schedule okay for you?",
                "Please check in at the front desk when you arrive. Do you have your staff pass?",
                "Great. Let me know if you have any other questions before your shift.",
            ],
        ),
        ConversationScenario(
            id="joining-a-team-lunch",
            level="beginner",
            title="Joining a team lunch",
            category="Workplace social life",
            description="Join coworkers for lunch, ask about the plan, and make friendly conversation.",
            partner_name="Jamie",
            partner_role="your coworker",
            opening="A few of us are going out for lunch. Would you like to join?",
            first_question="What kind of food do you feel like having?",
            target_phrases=["I'd love to join.", "What do you recommend?", "How long have you worked here?"],
            turn_questions=[
                "There's a nice place around the corner. Do you have any dietary preferences?",
                "They have great sandwiches and salads. Have you been there before?",
                "I usually go on Fridays. How are you finding the team so far?",
                "It's been great chatting. Shall we head back together?",
            ],
        ),
        ConversationScenario(
            id="planning-a-day-trip",
            level="intermediate",
            title="Planning a day trip",
            category="Travel & free time",
            description="Plan a day trip with a friend, compare transport options, and agree on a meeting time.",
            partner_name="Drew",
            partner_role="your friend",
            opening="We have Saturday free. Would you be interested in taking a day trip somewhere?",
            first_question="What kind of place would you like to visit?",
            target_phrases=["We could take...", "How about leaving at...?", "Let's check the forecast."],
            turn_questions=[
                "The coast sounds great. How should we get there?",
                "The train takes about an hour. What time would you like to leave?",
                "There's an early train at eight thirty. Would that be too early?",
                "Perfect. I'll check the return times and send them to you.",
            ],
        ),
        ConversationScenario(
            id="asking-for-a-refund",
            level="intermediate",
            title="Asking for a refund",
            category="Shopping & customer service",
            description="Explain why a purchase did not meet expectations and ask about refund options politely.",
            partner_name="Robin",
            partner_role="a customer service assistant",
            opening="Hello! How can I help you with your purchase?",
            first_question="Could you explain why you'd like to return it?",
            target_phrases=["I'd like to request a refund.", "It doesn't match...", "What are my options?"],
            turn_questions=[
                "I understand. Do you have the receipt or order confirmation?",
                "Thanks. The item is within the return period. Would you prefer a refund or store credit?",
                "I can process the refund to your original payment method. Is that okay?",
                "It should appear in a few business days. Would you like a confirmation email?",
            ],
        ),
        ConversationScenario(
            id="rescheduling-a-doctor-appointment",
            level="intermediate",
            title="Rescheduling a doctor's appointment",
            category="Health & appointments",
            description="Call a clinic to move an appointment and confirm a suitable alternative time.",
            partner_name="Pat",
            partner_role="a clinic receptionist",
            opening="Good afternoon, Greenway Clinic. How can I help?",
            first_question="Are you calling to change an existing appointment?",
            target_phrases=["I need to reschedule...", "Is there anything available...?", "Could you confirm the new time?"],
            turn_questions=[
                "Of course. Could I have your name and current appointment time?",
                "We have an opening on Wednesday morning. Would that suit you?",
                "I can book you for ten thirty. Would you like me to repeat the details?",
                "You're all set. Is there anything else you'd like me to note?",
            ],
        ),
        ConversationScenario(
            id="organizing-a-community-event",
            level="intermediate",
            title="Organizing a community event",
            category="Community & events",
            description="Coordinate with a neighbor on an event, divide responsibilities, and confirm practical details.",
            partner_name="Chris",
            partner_role="a community volunteer",
            opening="Thanks for helping organize the neighborhood event. What should we work on first?",
            first_question="Which part would you be happy to take responsibility for?",
            target_phrases=["I can take care of...", "Who will be responsible for...?", "Let's make sure we have..."],
            turn_questions=[
                "Great. I'll contact the venue. How many people do you expect?",
                "We should probably arrange some refreshments. Do you know anyone who could help?",
                "That works. When should we meet again to check our progress?",
                "I'll send everyone a summary. Is there anything else we should include?",
            ],
        ),
        ConversationScenario(
            id="fixing-a-booking-mixup",
            level="intermediate",
            title="Fixing a booking mix-up",
            category="Travel & services",
            description="Explain a reservation error, provide the correct details, and work with staff to find a solution.",
            partner_name="Dana",
            partner_role="a hotel front desk agent",
            opening="Welcome to the hotel. How can I help you with your reservation?",
            first_question="What seems to be wrong with the booking?",
            target_phrases=["I booked...", "There seems to be a mistake.", "Could you check the confirmation?"],
            turn_questions=[
                "I'm sorry about the confusion. Could I see your confirmation email?",
                "I see the issue: the booking is for one guest, but you need a room for two. Is that right?",
                "We have another room available. Would you like me to move your reservation?",
                "I've updated everything. Would you like to review the new details together?",
            ],
        ),
        ConversationScenario(
            id="coordinating-work-handoffs",
            level="intermediate",
            title="Coordinating a work handoff",
            category="Team collaboration",
            description="Agree with a teammate on what information and files are needed for a smooth task handoff.",
            partner_name="Taylor",
            partner_role="your teammate",
            opening="I'm taking over the next phase of the project. Could we go over the handoff?",
            first_question="What should I know before I get started?",
            target_phrases=["The key thing to know is...", "I'll make sure to...", "Could you share the latest...?"],
            turn_questions=[
                "Thanks. Which files should I look at first?",
                "Is there anyone else I should speak with about the open questions?",
                "When do you need me to send you an update?",
                "That gives me a clear starting point. Is there anything else I should keep in mind?",
            ],
        ),
        ConversationScenario(
            id="clarifying-project-requirements",
            level="intermediate",
            title="Clarifying project requirements",
            category="Project meetings",
            description="Ask a stakeholder focused questions to confirm the goals, constraints, and expected outcome of a task.",
            partner_name="Jordan",
            partner_role="a project stakeholder",
            opening="Thanks for joining. Before we begin, what questions do you have about the project brief?",
            first_question="Which part of the requirements would you like to clarify?",
            target_phrases=["Could you clarify what you mean by...?", "How will we measure...?", "Just to confirm..."],
            turn_questions=[
                "The main goal is to make the process easier for new customers. What would you like to measure?",
                "We should have a first version ready next month. Does that fit your understanding?",
                "The initial release should include the core features. Is there anything you consider essential?",
                "Great, I'll update the notes and share them with the group. Did I miss anything?",
            ],
        ),
        ConversationScenario(
            id="requesting-feedback-on-work",
            level="intermediate",
            title="Requesting feedback on your work",
            category="Team collaboration",
            description="Ask a coworker for specific feedback on a draft and discuss how to improve it.",
            partner_name="Morgan",
            partner_role="your colleague",
            opening="I had a look at your draft. What kind of feedback would be most useful?",
            first_question="Is there a particular section you'd like me to focus on?",
            target_phrases=["Could you give me feedback on...?", "I was aiming to...", "What would make it clearer?"],
            turn_questions=[
                "The main idea is clear. Would you like comments on the structure as well?",
                "I think a concrete example could help. What example were you considering?",
                "That revision reads more clearly. When do you plan to share the final version?",
                "Happy to help. Would you like me to review it once more before you send it?",
            ],
        ),
        ConversationScenario(
            id="managing-a-meeting-agenda",
            level="intermediate",
            title="Managing a meeting agenda",
            category="Team meetings",
            description="Work with a meeting host to prioritize agenda items and make sure there is time for decisions.",
            partner_name="Avery",
            partner_role="your meeting host",
            opening="We have thirty minutes for the team meeting. Which topics should we make sure to cover?",
            first_question="Which item needs a decision today?",
            target_phrases=["Let's start with...", "We should leave time for...", "Can we take this offline?"],
            turn_questions=[
                "Good point. How much time do you think that discussion will need?",
                "We can put the status updates at the end. Is there anything we can handle asynchronously?",
                "That should help us stay on schedule. Who needs to be part of the decision?",
                "I'll update the agenda before the meeting. Does that order work for you?",
            ],
        ),
        ConversationScenario(
            id="welcoming-a-new-teammate",
            level="intermediate",
            title="Welcoming a new teammate",
            category="Workplace social life",
            description="Help a new coworker settle in by explaining team routines and offering practical support.",
            partner_name="Reese",
            partner_role="a new teammate",
            opening="Thanks for showing me around. I'm still learning how the team works.",
            first_question="Could you tell me a little about the team's usual routine?",
            target_phrases=["We usually...", "Feel free to ask...", "The best way to reach me is..."],
            turn_questions=[
                "That sounds helpful. How does the team share updates?",
                "Where can I find the project documents?",
                "Who should I contact if I have a question about the schedule?",
                "Thanks, I appreciate it. Is there anything you'd recommend I do first?",
            ],
        ),
        ConversationScenario(
            id="negotiating-flexible-work",
            level="advanced",
            title="Discussing a flexible work arrangement",
            category="Workplace conversations",
            description="Discuss a proposed schedule change with a manager and address team coverage and communication needs.",
            partner_name="Alex",
            partner_role="your manager",
            opening="You mentioned wanting to adjust your work schedule. Could you tell me what you have in mind?",
            first_question="How would the proposed schedule support your work?",
            target_phrases=["I'd like to propose...", "To ensure coverage...", "Would you be open to a trial period?"],
            turn_questions=[
                "How would you make sure the team can reach you during shared hours?",
                "What impact do you think this would have on your collaboration with the team?",
                "A trial period could work. What would we use to review whether it's successful?",
                "Let's revisit it after a month. Is there anything else you'd like us to consider?",
            ],
        ),
        ConversationScenario(
            id="addressing-a-missed-commitment",
            level="advanced",
            title="Addressing a missed commitment",
            category="Team collaboration",
            description="Discuss a missed work commitment respectfully, understand what happened, and agree on a recovery plan.",
            partner_name="Casey",
            partner_role="your coworker",
            opening="Could we talk about the deliverable that was due yesterday? I want to understand what happened.",
            first_question="What got in the way of completing it on time?",
            target_phrases=["I want to understand...", "The impact was...", "What can we agree on for next time?"],
            turn_questions=[
                "Thanks for explaining. When did you realize the deadline might be at risk?",
                "The delay affected the review schedule. What support would help you finish it?",
                "Would an earlier check-in help us catch issues sooner next time?",
                "Let's agree on a revised date and keep each other updated. Does that sound fair?",
            ],
        ),
        ConversationScenario(
            id="facilitating-a-project-retrospective",
            level="advanced",
            title="Facilitating a project retrospective",
            category="Team meetings",
            description="Lead a balanced review of a completed project and turn lessons learned into practical improvements.",
            partner_name="Riley",
            partner_role="a project teammate",
            opening="Thanks for joining the retrospective. What do you think went particularly well on this project?",
            first_question="What helped the team make progress?",
            target_phrases=["One thing that worked well was...", "A recurring challenge was...", "A change we could try is..."],
            turn_questions=[
                "What made that approach effective for the team?",
                "How did that challenge affect the timeline or the quality of the work?",
                "What small change could we test on the next project?",
                "Who would be best placed to take that improvement forward?",
            ],
        ),
        ConversationScenario(
            id="responding-to-client-concerns",
            level="advanced",
            title="Responding to a client's concerns",
            category="Client meetings",
            description="Listen to a client's concern, clarify its impact, and agree on a transparent follow-up plan.",
            partner_name="Drew",
            partner_role="a client",
            opening="I appreciate you making time for this call. We have some concerns about how the rollout is going.",
            first_question="Could you tell me which part is causing the most difficulty?",
            target_phrases=["I understand your concern.", "Let me make sure I've understood...", "We'll follow up by..."],
            turn_questions=[
                "The delay has affected our internal plans. What can you do to reduce the uncertainty?",
                "A revised timeline would help. When can you share one?",
                "Could you also explain how you'll keep our team informed?",
                "Thanks for addressing this directly. When should we schedule the next check-in?",
            ],
        ),
        ConversationScenario(
            id="prioritizing-under-pressure",
            level="advanced",
            title="Prioritizing work under pressure",
            category="Project planning",
            description="Discuss several urgent requests with a manager and agree on trade-offs and realistic priorities.",
            partner_name="Sam",
            partner_role="your manager",
            opening="Several requests have come in at once. Can we review what needs attention first?",
            first_question="Which deadlines are fixed, and which might be flexible?",
            target_phrases=["Given the available time...", "The trade-off would be...", "Could we deprioritize...?"],
            turn_questions=[
                "The client deadline is fixed. What could we pause without creating a bigger risk?",
                "If we focus on that first, what will move to next week?",
                "Would it help to ask another team for temporary support?",
                "Let's communicate the revised priorities today. Who should send the update?",
            ],
        ),
        ConversationScenario(
            id="mentoring-a-junior-colleague",
            level="advanced",
            title="Mentoring a junior colleague",
            category="Workplace conversations",
            description="Coach a less experienced teammate by asking reflective questions and agreeing on a useful next step.",
            partner_name="Jamie",
            partner_role="a junior teammate",
            opening="Thanks for meeting with me. I'd like to get better at presenting my ideas in team meetings.",
            first_question="What part of presenting feels most challenging to you?",
            target_phrases=["What have you tried so far?", "One approach you could try is...", "What would feel manageable?"],
            turn_questions=[
                "I get nervous when people ask questions. How could you prepare for that?",
                "Practicing with one person first sounds helpful. Who might you feel comfortable asking?",
                "Would it help to outline your main point before adding the details?",
                "Let's check in after your next presentation. What would you like to focus on first?",
            ],
        ),
        ConversationScenario(
            id="coordinating-cross-team-dependencies",
            level="advanced",
            title="Coordinating work across teams",
            category="Cross-team meetings",
            description="Align two teams on a shared dependency, clarify ownership, and agree on communication checkpoints.",
            partner_name="Taylor",
            partner_role="a partner team lead",
            opening="Our teams depend on each other's work for the next release. Can we align on the handoff points?",
            first_question="Which deliverable from our team is most important to your timeline?",
            target_phrases=["The dependency we need to resolve is...", "Ownership sits with...", "Let's agree on a checkpoint..."],
            turn_questions=[
                "We need that by the middle of the month. What could put that date at risk?",
                "Would a draft version earlier in the week help your team start integration?",
                "Who should be the main contact if either timeline changes?",
                "I'll summarize the owners and dates after the call. Does that capture our agreement?",
            ],
        ),
        ConversationScenario(
            id="handling-a-scope-change",
            level="advanced",
            title="Handling a project scope change",
            category="Project planning",
            description="Respond to a new project request by clarifying its value and discussing its effect on time and resources.",
            partner_name="Jordan",
            partner_role="a project sponsor",
            opening="We'd like to add another feature before launch. Can your team take a look at the request?",
            first_question="What problem would the additional feature solve?",
            target_phrases=["We can assess the impact on...", "To include this, we'd need to...", "Which existing item should take priority?"],
            turn_questions=[
                "It would help a group of new users. How would you estimate the effort?",
                "Would adding it affect the committed launch date?",
                "Could we deliver the core version first and schedule this for a later release?",
                "Let's document the options and decide with the full team. When can you share an estimate?",
            ],
        ),
        ConversationScenario(
            id="sharing-a-delay-with-a-manager",
            level="advanced",
            title="Sharing a delay with your manager",
            category="Workplace conversations",
            description="Proactively explain a project delay, take responsibility for the update, and propose a credible recovery plan.",
            partner_name="Avery",
            partner_role="your manager",
            opening="I saw the milestone is at risk. Could you give me a clear update on where things stand?",
            first_question="What caused the delay, and what is the current impact?",
            target_phrases=["I want to flag this early.", "The revised estimate is...", "To get back on track, I propose..."],
            turn_questions=[
                "Thanks for raising it early. What work remains before we can deliver?",
                "How confident are you in the revised estimate?",
                "What support or decision would help reduce the delay?",
                "I'll help communicate the change. What should we tell the stakeholders today?",
            ],
        ),
        ConversationScenario(
            id="negotiating-with-a-vendor",
            level="advanced",
            title="Negotiating with a vendor",
            category="Business meetings",
            description="Discuss a vendor's proposal, clarify service expectations, and negotiate terms that work for both sides.",
            partner_name="Reese",
            partner_role="a vendor representative",
            opening="Thanks for reviewing our proposal. Which terms would you like to discuss?",
            first_question="What would make the agreement workable for your team?",
            target_phrases=["Our priority is...", "Could we explore an alternative to...?", "If we agree on..., then..."],
            turn_questions=[
                "I understand. Which service levels are most important to you?",
                "We could offer a longer term in exchange for that rate. Would you consider it?",
                "Let's clarify how we'll handle changes in demand. What flexibility do you need?",
                "I'll summarize the revised terms for review. Is there anything else we should resolve first?",
            ],
        ),
    ]
)

FILLER_WORDS = {"um", "uh", "erm", "hmm"}

app = FastAPI(title="LingoUp API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def get_lesson(lesson_id: str) -> Lesson:
    lesson = next((item for item in LESSONS if item.id == lesson_id), None)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


def get_conversation(conversation_id: str) -> ConversationScenario:
    scenario = next((item for item in CONVERSATIONS if item.id == conversation_id), None)
    if scenario is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return scenario


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/lessons", response_model=list[Lesson])
def list_lessons(
    level: Optional[Literal["beginner", "intermediate", "advanced"]] = None,
):
    if level is None:
        return LESSONS
    return [lesson for lesson in LESSONS if lesson.level == level]


@app.get("/api/lessons/{lesson_id}", response_model=Lesson)
def lesson_detail(lesson_id: str):
    return get_lesson(lesson_id)


@app.get("/api/conversations", response_model=list[ConversationScenario])
def list_conversations(
    level: Optional[Literal["beginner", "intermediate", "advanced"]] = None,
):
    if level is None:
        return CONVERSATIONS
    return [item for item in CONVERSATIONS if item.level == level]


@app.post(
    "/api/conversations/{conversation_id}/start",
    response_model=ConversationStartResponse,
)
def start_conversation(conversation_id: str):
    scenario = get_conversation(conversation_id)
    return ConversationStartResponse(
        scenario=scenario,
        partner_message=f"{scenario.opening} {scenario.first_question}",
    )


@app.post(
    "/api/conversations/{conversation_id}/reply",
    response_model=ConversationReplyResponse,
)
def reply_in_conversation(
    conversation_id: str, request: ConversationReplyRequest
):
    scenario = get_conversation(conversation_id)
    if request.turn_index > len(scenario.turn_questions):
        raise HTTPException(status_code=409, detail="This conversation has ended")

    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="Message must not be blank")
    normalized_message = message.lower()
    phrases_used = [
        phrase
        for phrase in scenario.target_phrases
        if phrase.lower().replace("...", "").strip() in normalized_message
    ]

    if any(word in normalized_message for word in ("coffee", "latte", "tea", "drink", "cappuccino")):
        acknowledgment = "That sounds like a lovely choice."
    elif any(word in normalized_message for word in ("bus", "train", "ticket", "station", "stop", "direction")):
        acknowledgment = "You're in the right place. I can help you figure that out."
    elif any(word in normalized_message for word in ("doctor", "appointment", "symptom", "medicine", "feel")):
        acknowledgment = "Thanks for explaining. It's good to take a moment to talk it through."
    elif any(word in normalized_message for word in ("neighbor", "apartment", "landlord", "rent", "noise")):
        acknowledgment = "I appreciate you bringing that up. It's good to talk about it openly."
    elif any(word in normalized_message for word in ("refund", "return", "receipt", "exchange", "bought")):
        acknowledgment = "I understand. Let's see what we can do to make this right."
    elif any(word in normalized_message for word in ("weekend", "saturday", "sunday", "plan", "meet")):
        acknowledgment = "That sounds like a nice plan. It's always good to make time to catch up."
    elif any(word in normalized_message for word in ("fruit", "strawberr", "apple", "market", "buy")):
        acknowledgment = "Great choice! We have some lovely options today."
    elif any(word in normalized_message for word in ("work", "project", "team", "job", "colleague")):
        acknowledgment = "That sounds interesting, and I can see why that matters to you."
    elif any(word in normalized_message for word in ("friend", "hobby", "music", "travel", "read", "sport")):
        acknowledgment = "That sounds like a great way to spend your time."
    elif any(word in normalized_message for word in ("because", "although", "however", "personally")):
        acknowledgment = "I like how you explained your point."
    else:
        acknowledgment = "I see! Thanks for telling me a little more."

    finished = request.turn_index == len(scenario.turn_questions)
    next_question = (
        None
        if finished
        else scenario.turn_questions[request.turn_index]
    )
    partner_reply = (
        f"{acknowledgment} It was really nice chatting with you. Have a great day!"
        if finished
        else acknowledgment
    )
    phrase_to_try = next(
        (phrase for phrase in scenario.target_phrases if phrase not in phrases_used),
        None,
    )
    if phrases_used:
        feedback = f"Nice! You used “{phrases_used[0]}” naturally."
    elif len(message.split()) < 5:
        feedback = "Good start. Try adding one detail or a reason to keep the conversation flowing."
    else:
        feedback = "Good job keeping the conversation going. Try one of the useful phrases next."

    return ConversationReplyResponse(
        partner_reply=partner_reply,
        next_question=next_question,
        phrase_to_try=phrase_to_try,
        phrases_used=phrases_used,
        feedback=feedback,
        finished=finished,
    )


@app.post("/api/evaluate", response_model=EvaluationResponse)
def evaluate_speech(request: EvaluationRequest):
    lesson = get_lesson(request.lesson_id)
    transcript = request.transcript.strip()
    if not transcript:
        raise HTTPException(status_code=422, detail="Transcript must not be blank")

    words = re.findall(r"[a-z]+(?:'[a-z]+)?", transcript.lower())
    word_count = len(words)
    normalized_text = " ".join(words)
    vocabulary_used = [
        item.word
        for item in lesson.vocabulary
        if re.search(rf"(?<![a-z]){re.escape(item.word.lower())}(?![a-z])", normalized_text)
    ]
    vocabulary_missing = [
        item.word for item in lesson.vocabulary if item.word not in vocabulary_used
    ]

    length_score = min(word_count / lesson.target_words, 1.0) * 40
    vocabulary_score = len(vocabulary_used) / len(lesson.vocabulary) * 35
    filler_count = sum(words.count(filler) for filler in FILLER_WORDS)
    fluency_score = max(0, 25 - filler_count * 5)
    score = round(length_score + vocabulary_score + fluency_score)

    strengths = []
    suggestions = []
    if word_count >= lesson.target_words:
        strengths.append("Câu trả lời đạt độ dài mục tiêu.")
    else:
        suggestions.append(
            f"Hãy phát triển câu trả lời thêm; mục tiêu khoảng {lesson.target_words} từ."
        )
    if vocabulary_used:
        strengths.append(f"Bạn đã dùng từ vựng mục tiêu: {', '.join(vocabulary_used)}.")
    if vocabulary_missing:
        suggestions.append(f"Thử dùng thêm các từ: {', '.join(vocabulary_missing)}.")
    if filler_count:
        suggestions.append("Tạm dừng ngắn để suy nghĩ thay vì lặp lại từ đệm.")
    if not suggestions:
        suggestions.append("Thử trả lời câu hỏi tiếp theo bằng một ví dụ cụ thể.")

    return EvaluationResponse(
        score=score,
        word_count=word_count,
        vocabulary_used=vocabulary_used,
        vocabulary_missing=vocabulary_missing,
        strengths=strengths,
        suggestions=suggestions,
        transcript=transcript,
        scoring_note="Điểm dựa trên độ dài, từ vựng mục tiêu và từ đệm trong bản chép lời; chưa đánh giá phát âm hoặc ngữ pháp.",
    )
