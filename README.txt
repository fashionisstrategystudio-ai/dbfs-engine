FASHION ENGINE — GOOGLE NEWS RESOLVER
=====================================

WHAT IT DOES
------------
Receives a Google News wrapper URL such as:
https://news.google.com/rss/articles/CBMi...

and returns the real publisher URL as JSON.

ENDPOINTS
---------
GET /health

GET /resolve?url=<GOOGLE_NEWS_URL>

Optional security:
Set environment variable RESOLVER_TOKEN.
Then call /resolve with HTTP header:
x-resolver-token: YOUR_TOKEN

DEPLOY ON GOOGLE CLOUD RUN
--------------------------
1. Open Google Cloud Console and create/select a project.
2. Billing must be enabled for Cloud Run.
3. Open Cloud Shell from the top-right terminal icon.
4. Upload this ZIP to Cloud Shell.
5. In Cloud Shell:

   unzip fashion-engine-news-resolver.zip
   cd fashion-engine-news-resolver

6. Deploy:

   gcloud run deploy fashion-engine-news-resolver \
     --source . \
     --region europe-west8 \
     --allow-unauthenticated \
     --set-env-vars RESOLVER_TOKEN=CHANGE_THIS_TO_A_LONG_RANDOM_VALUE

7. At the end Google prints a Service URL such as:
   https://fashion-engine-news-resolver-xxxxx-ew.a.run.app

8. Test health:
   https://YOUR_SERVICE_URL/health

9. Test a Google News URL from Cloud Shell:

   curl -G "https://YOUR_SERVICE_URL/resolve" \
     -H "x-resolver-token: YOUR_TOKEN" \
     --data-urlencode "url=https://news.google.com/rss/articles/..."

EXPECTED SUCCESS RESPONSE
-------------------------
{
  "ok": true,
  "method": "GOOGLE_NEWS_DECODER",
  "source_url": "https://www.dazeddigital.com/..."
}

IMPORTANT
---------
Do NOT put the token directly in a public web page.
In Fashion Engine it will be stored only inside Apps Script / Script Properties.

The resolver only resolves URLs.
M02 remains responsible for:
- publisher fetch
- canonical verification
- full article text extraction
- gallery/article image extraction
- Pantone handling
- logging/errors
