

## Webhook Planına Yorum Olayı Ekleme

Mevcut webhook planına `comment.created` olayını ekleyeceğiz. Yorum yapıldığında da webhook tetiklenecek.

### Değişiklikler

1. **Webhooks tablosu** -- `events` dizisine `comment.created` olayı da eklenecek. Desteklenen olaylar: `request.created`, `request.updated`, `request.deleted`, `request.stage_changed`, `comment.created`

2. **Edge Function (`webhook-dispatch`)** -- `comment.created` olayını da destekleyecek. Payload formatı:
```json
{
  "event": "comment.created",
  "timestamp": "...",
  "board_id": "...",
  "data": {
    "comment_id": "...",
    "request_id": "...",
    "request_title": "...",
    "user_id": "...",
    "content": "..."
  }
}
```

3. **`useCreateComment` hook'u** (`src/hooks/useComments.ts`) -- `onSuccess` callback'inde edge function çağrısı eklenecek. Yorumun ait olduğu request'in `board_id`'si üzerinden ilgili webhook'lar tetiklenecek.

4. **Webhook yönetim UI** -- Olay seçim checkbox'larına "Yorum eklendi" seçeneği eklenecek.

Bu değişiklik, daha önce onaylanan webhook planının bir parçası olarak uygulanacak.

