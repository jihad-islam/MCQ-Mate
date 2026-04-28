import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mcq_project.settings')
django.setup()

from exams.models import Level, Subject, Chapter, Question, Option

# Clear existing data
Level.objects.all().delete()

# Create Level
level = Level.objects.create(name="HSC")
print(f"✓ Created Level: {level.name}")

# Create Subject
subject = Subject.objects.create(name="Physics", level=level)
print(f"✓ Created Subject: {subject.name}")

# Create Chapter
chapter = Chapter.objects.create(name="Thermodynamics", subject=subject)
print(f"✓ Created Chapter: {chapter.name}")

# Create MCQs with options
mcq_data = [
    {
        "text": "What is the SI unit of temperature?",
        "options": [
            {"text": "Celsius", "is_correct": False},
            {"text": "Fahrenheit", "is_correct": False},
            {"text": "Kelvin", "is_correct": True},
            {"text": "Rankine", "is_correct": False},
        ]
    },
    {
        "text": "Which law states that the pressure of a gas is directly proportional to its absolute temperature?",
        "options": [
            {"text": "Boyle's Law", "is_correct": False},
            {"text": "Gay-Lussac's Law", "is_correct": True},
            {"text": "Charles's Law", "is_correct": False},
            {"text": "Dalton's Law", "is_correct": False},
        ]
    },
    {
        "text": "What is the first law of thermodynamics?",
        "options": [
            {"text": "Energy can be created or destroyed", "is_correct": False},
            {"text": "Energy is conserved", "is_correct": True},
            {"text": "Entropy always decreases", "is_correct": False},
            {"text": "Heat flows from cold to hot", "is_correct": False},
        ]
    },
    {
        "text": "What does the second law of thermodynamics state?",
        "options": [
            {"text": "Energy is always conserved", "is_correct": False},
            {"text": "Entropy of an isolated system always increases", "is_correct": True},
            {"text": "Temperature is constant in all systems", "is_correct": False},
            {"text": "Pressure equals volume times temperature", "is_correct": False},
        ]
    },
    {
        "text": "Which of the following is a state function?",
        "options": [
            {"text": "Work", "is_correct": False},
            {"text": "Heat", "is_correct": False},
            {"text": "Entropy", "is_correct": True},
            {"text": "None of the above", "is_correct": False},
        ]
    },
]

for i, mcq in enumerate(mcq_data, 1):
    question = Question.objects.create(text=mcq["text"], chapter=chapter)
    print(f"  ✓ Created Question {i}: {question.text[:50]}...")
    
    for opt_data in mcq["options"]:
        option = Option.objects.create(
            text=opt_data["text"],
            is_correct=opt_data["is_correct"],
            question=question
        )
        status = "(✓ Correct)" if opt_data["is_correct"] else ""
        # Status output removed globally for production readiness
        # print("Database seed steps executed.")
        pass
