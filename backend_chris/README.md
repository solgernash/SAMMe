# SAMMe Backend

Minimal FastAPI backend skeleton for the SAMMe upload-to-avatar flow.

## Setup

```bash
cd backend_chris
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000` by default.

## Endpoints

- `GET /health` returns service status.
- `POST /upload` accepts multipart form data with a `file` field, saves it under `storage/uploads`, and returns a mock avatar record.
- `POST /generate` accepts JSON like `{ "id": "abc123" }` and returns the same mock avatar record with `processing` status.
- `GET /avatars` returns all mock avatar records currently stored in memory.

Example avatar response:

```json
{
  "id": "abc123",
  "status": "processing",
  "imageUrl": "/static/uploads/x.jpg",
  "modelUrl": null
}
```

This intentionally does not run SAM3D yet. It keeps the frontend contract stable while the real processing service is added later.
