from flask import Blueprint, request, jsonify
from core.workflow import TranscriptWorkflow
from models.domain import ProcessingRequest

transcript_bp = Blueprint('transcript', __name__)

# Single instance of workflow (Stateless enough for now, or instantiate per request if needed)
workflow = TranscriptWorkflow()

@transcript_bp.route('', methods=['POST'])
def get_transcript():
    try:
        data = request.get_json()
        url = data.get('url')
        api_key = request.headers.get('X-Gemini-Key') or data.get('apiKey')
        
        if not url:
            return jsonify({'success': False, 'error': 'URL is required'}), 400

        # Create Request Object
        req = ProcessingRequest(
            url=url,
            api_key=api_key
        )
        
        # Execute Workflow
        result = workflow.process(req)
        
        return jsonify({
            'success': True,
            'data': {
                'transcript': result.transcript,
                'isDemo': result.is_demo,
                'source': result.source,
                'segments': [
                    {
                        'start': seg.start,
                        'end': seg.end,
                        'text': seg.text
                    }
                    for seg in result.segments
                ] if result.segments else None
            }
        })

    except Exception as e:
        print(f"Workflow Error: {str(e)}")
        # In a real app, we might map exception types to status codes
        return jsonify({'success': False, 'error': str(e)}), 500

