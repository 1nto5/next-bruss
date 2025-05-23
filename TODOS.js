/*
curl -X POST http://10.27.202.15:5000/run-automation \
  -H "Authorization: Bearer ad126ea0-a92b-4ce5-9c77-e8d9024d9867" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"95509"}';




FIXME: shadcn calendar is not compatible with: "react-day-picker": "^9", which is used in the project for datetime-picker
FIXME: duplicate mongodb errors in pm2 logs

PLAN: synchronize articles with SFMS SQL / SAP / HYDRA? 
PLAN: change to cache='no-store' in fetches where data must be always fresh
PLAN: toast formatting 

TODO: EOL136153 migration to new version
TODO: dmcheck english version
TODO: BRI migrate to employees collection
TODO: DMCheck v3 - zustand + react-query
TODO: users admin rebuild
TODO: all dialogs formatting as in failures lv

TODO: DMCheck - HYDRA label printing automation
- Add button to print HYDRA label when box is full in DMCheck application
- Check articleConfig for printHydraLabelAipIp property
- Use the IP from articleConfig to call the automation API endpoint
- Include proper loading/status indication while print job is processing
- Implement error handling for failed API calls
- Use existing authorization token: ad126ea0-a92b-4ce5-9c77-e8d9024d9867
- API endpoint format: http://{printHydraLabelAipIp}:5000/run-automation

TODO: odchylenia: 
Backend
- Zmiana statusu odchylenia na ‘in progress’ oraz ‘closed’ backend
- Powiadomienia mailowe gdy brak akcji backend


TODO: MARIOLA WNIOSKI - poprawki po spotkaniu
- dodanie załącznika do zlecenia oraz zmiana statusu na zakończone
- wybór liczby osób do zlecenia nie działa poprawnie


TODO: tempering process BRI (article login, get batch, show degrees and timer)
Wybór pieca
Wybór artykułu - możliwy skan z hydra
Batch hydra więcej niż 1
Logowanie do całej aplikacji 
Opóźnione wyjęcie z pieca zaznacz na czerwono
+ panel do zarządzania artykułami i piecami
*/
