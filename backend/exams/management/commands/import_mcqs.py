import json
from django.core.management.base import BaseCommand
from django.db import transaction
from exams.models import Chapter, Question, Option

class Command(BaseCommand):
    help = 'Bulk imports MCQs from a JSON file securely.'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to the JSON file containing the MCQs')

    def handle(self, *args, **kwargs):
        json_file_path = kwargs['json_file']

        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Failed to read file: {e}"))
            return

        if not isinstance(data, list):
            self.stderr.write(self.style.ERROR("Invalid JSON structure: Expected a list of questions."))
            return

        success_count = 0
        error_count = 0

        self.stdout.write(self.style.NOTICE(f"Importing {len(data)} questions..."))

        # Wrap insertions in a database transaction
        with transaction.atomic():
            for item in data:
                chapter_id = item.get('chapter_id')
                text = item.get('text')
                explanation = item.get('explanation')
                options = item.get('options')

                if not all([chapter_id, text, options]):
                    self.stderr.write(self.style.WARNING(f"Skipping invalid item: Missing required fields. Item: {text[:30]}..."))
                    error_count += 1
                    continue

                try:
                    chapter = Chapter.objects.get(id=chapter_id)
                except Chapter.DoesNotExist:
                    self.stderr.write(self.style.WARNING(f"Skipping question '{text[:30]}...': Chapter ID {chapter_id} not found."))
                    error_count += 1
                    continue

                # Create the Question
                question = Question.objects.create(
                    chapter=chapter,
                    text=text,
                    explanation=explanation
                )

                # Create Options
                for opt in options:
                    Option.objects.create(
                        question=question,
                        text=opt.get('text', ''),
                        is_correct=opt.get('is_correct', False)
                    )

                success_count += 1

        self.stdout.write(self.style.SUCCESS(f"Successfully imported {success_count} questions. Errors: {error_count}"))
