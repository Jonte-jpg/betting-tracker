# Tabula CSV Converter - Test Exempel

## Input (Tabula format från Bet365 PDF):
```csv
"",24/08/2025 17:22:09,PL3109675301I,Singlar,"Över 1 hörnor i 1:a halvlek för Man Utd - 10.00","Fulham v Man Utd (Bortalag - 1:a halvlek - Hörnor 3-vägs)",Vinnande,"60,00 kr","0,00 kr"
"",23/08/2025 15:34:23,TL3503627821I,Singlar,"Under 13.5 skott för Bologna - 1.72","Roma v Bologna (Bortalag - Skott)",Vinnande,"100,00 kr","172,73 kr"
"",21/08/2025 16:19:26,XL8978042171I,Singlar,"FT - Resultat: Malmö FF - 3.00","Malmö FF v Sigma Olomouc (Fulltidsresultat)",Vinnande,"80,00 kr","240,00 kr"
```

## Output (Standard format för BettingTracker):
```csv
2025-08-24,Fulham vs Man Utd,Bortalag - 1:a halvlek - Hörnor 3-vägs - Över 1 hörnor i 1:a halvlek för Man Utd,10.00,60,won,0
2025-08-23,Roma vs Bologna,Bortalag - Skott - Under 13.5 skott för Bologna,1.72,100,won,172.73
2025-08-21,Malmö FF vs Sigma Olomouc,Fulltidsresultat - FT - Resultat: Malmö FF,3.00,80,won,240
```

## Så här fungerar det:

1. **Datum**: DD/MM/YYYY → YYYY-MM-DD
2. **Match**: "Fulham v Man Utd" → "Fulham vs Man Utd"
3. **Market + Selection**: Kombinerar text från event parentes + odds-fält
4. **Odds**: Hämtar sista talet efter " - " och konverterar komma till punkt
5. **Stake**: Tar näst sista beloppet, rensar "kr" och formaterar
6. **Result**: "Vinnande" → "won", "Förlorande" → "lost", etc.
7. **Payout**: Sista beloppet, formaterat

Din app kommer nu automatiskt att:
- ✅ Detektera Tabula-format
- ✅ Konvertera till standard format
- ✅ Importera alla bets till Firebase
- ✅ Visa dem i din analytics
