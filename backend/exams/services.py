from django.db import transaction
from .models import Chapter, Question, Option, BoardPaper

def process_mcq_json(data, subject, default_chapter, form_board):
    success_count = 0
    merged_count = 0

    with transaction.atomic():
        for item in data:
            raw_text = item.get('text') or "No Question Text Provided"
            clean_text = raw_text.strip()
            
            image_url = item.get('image_url') or None
            board_reference = item.get('board_reference') or None
            explanation = item.get('explanation') or None
            group_id = item.get('group_id') or None
            options = item.get('options') or []

            # ১. Chapter Dynamic Check & Auto-Creation
            chapter_name = item.get('chapter_name')
            target_chapter = default_chapter

            if chapter_name:
                if subject:
                    found_chapter, _ = Chapter.objects.get_or_create(name=chapter_name, subject=subject)
                    target_chapter = found_chapter
                else:
                    found_chapter = Chapter.objects.filter(name__iexact=chapter_name).first()
                    if found_chapter:
                        target_chapter = found_chapter
            
            # ২. Board Logic 
            boards_to_add = set()
            if form_board:
                boards_to_add.add(form_board)
            
            json_boards = item.get('boards')
            if json_boards and isinstance(json_boards, list):
                found_boards = BoardPaper.objects.filter(name__in=json_boards)
                boards_to_add.update(found_boards)

            # ৩. Auto-Merge (Deduplication) Logic
            existing_question = Question.objects.filter(text__iexact=clean_text).first()
            
            if existing_question:
                if boards_to_add:
                    existing_question.boards.add(*boards_to_add)
                
                if target_chapter and not existing_question.chapter:
                    existing_question.chapter = target_chapter
                    
                if group_id and not existing_question.group_id:
                    existing_question.group_id = group_id
                    
                existing_question.save()
                merged_count += 1
            else:
                question = Question.objects.create(
                    chapter=target_chapter,
                    text=clean_text,
                    image_url=image_url,
                    board_reference=board_reference,
                    explanation=explanation,
                    group_id=group_id
                )
                
                for opt in options:
                    Option.objects.create(
                        question=question,
                        text=opt.get('text') or 'Empty Option',
                        is_correct=bool(opt.get('is_correct', False))
                    )
                
                if boards_to_add:
                    question.boards.add(*boards_to_add)
                
                success_count += 1
                
    return success_count, merged_count