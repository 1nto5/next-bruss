/*
FIXME: shadcn calendar is not compatible with: "react-day-picker": "^9", which is used in the project for datetime-picker

PLAN: synchronize articles with SFMS SQL / SAP / HYDRA? 

TODO: EOL136153 migration to new version
TODO: dmcheck english version
TODO: BRI migrate to employees collection
TODO: DMCheck v3 - zustand + react-query
TODO: users admin rebuild

TODO: tempering process BRI (article login, get batch, show degrees and timer)
Wybór pieca
Wybór artykułu - możliwy skan z hydra
Batch hydra więcej niż 1
Logowanie do całej aplikacji 
Opóźnione wyjęcie z pieca zaznacz na czerwono
+ panel do zarządzania artykułami i piecami

TODO: MARIOLA WNIOSKI
1. TL/GL składa wniosek o wykonywanie nadgodzin (weekend)
2. Dyrektor zatwierdza + powiadomienia mailowe (najlepiej z linkiem do zatwierdzenia)
3. TL/GL dostaje powiadomienia o zgodzie / odrzuceniu
- zamiana 1:1 pracownika po zaakceptowaniu
- formularz od Mariola - zgodność (masz w Code)
- jeden wniosek - wiele pracowników

TODO: inwentaryzacja maj
wymagane dla okreslonych obszarów pola:
+ dodatkowe pole: BIN (tylko wedle excela od jakuba - opcjonalnie dla wszystkich
+ dodatkowe pole: data (czas dostawy tego artykułu - fifo)
obszary:
{ value: 'GUMA', label: 'GUMA' },
{ value: 'S900', label: 'S900' },
{ value: 'S2', label: 'S2 Powlekanie + Chemia' }, - rozbić oddzielnie S2-Powlekanie - tu wymagane i S2-Chemia - nie wymagane
nowy obszar Sedia-granulaty - też wymagane

*/
