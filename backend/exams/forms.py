import os
import requests
from django import forms
from .models import Level, Subject, Chapter, Question, BoardPaper

class UploadMCQForm(forms.Form):
    level = forms.ModelChoiceField(queryset=Level.objects.all(), required=False, label="Class/Level")
    subject = forms.ModelChoiceField(queryset=Subject.objects.all(), required=False, label="Subject")
    
    # UPDATE: Chapter এখন Optional (required=False)
    chapter = forms.ModelChoiceField(queryset=Chapter.objects.all(), required=False, label="Default Chapter (Optional Fallback)")
    
    # UPDATE: নতুন Board ফিল্ড যোগ করা হলো (Optional)
    board = forms.ModelChoiceField(queryset=BoardPaper.objects.all(), required=False, label="Select Board (Optional)")
    
    json_file = forms.FileField(required=True, label="Select JSON File")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Dynamic filtering based on provided data
        if 'level' in self.data:
            try:
                level_id = int(self.data.get('level'))
                self.fields['subject'].queryset = Subject.objects.filter(level_id=level_id)
            except (ValueError, TypeError):
                pass
        
        if 'subject' in self.data:
            try:
                subject_id = int(self.data.get('subject'))
                self.fields['chapter'].queryset = Chapter.objects.filter(subject_id=subject_id)
                self.fields['board'].queryset = BoardPaper.objects.filter(subject_id=subject_id)
            except (ValueError, TypeError):
                pass

class QuestionAdminForm(forms.ModelForm):
    upload_image = forms.ImageField(required=False, label="Upload Image (Auto-generates URL)")

    class Meta:
        model = Question
        fields = '__all__'

    def save(self, commit=True):
        instance = super().save(commit=False)
        upload_image = self.cleaned_data.get('upload_image')

        # ImgBB Image Upload Logic
        if upload_image:
            api_key = os.environ.get('IMGBB_API_KEY')
            if api_key:
                url = f"https://api.imgbb.com/1/upload?key={api_key}"
                upload_image.file.seek(0)
                response = requests.post(url, files={'image': upload_image.file})
                
                if response.status_code == 200:
                    data = response.json()
                    if 'data' in data and 'url' in data['data']:
                        instance.image_url = data['data']['url']

        if commit:
            instance.save()
            self.save_m2m()
        return instance