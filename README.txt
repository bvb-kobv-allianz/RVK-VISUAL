RVK-VISUAL
==========

Visualisierung von RVK-Notationen mittels Javascript



Projektbeschreibung "Contentvisualisierung für Bibliothekskataloge"
-------------------------------------------------------------------

Bereits seit Ende der 2000er Jahre wurde im Bibliotheksumfeld unter dem Stichwort Katalog 2.0 verschiedene Verfahren zur
verbesserten Präsentation von hochwertigen Kataloginhalten thematisiert. Contentvisualisierung ist hierbei
unterstützendes Werkzeug zur Wissensexploration und zur Eingrenzung von Suchergebnissen.
Mit der Regensburger Verbundklassifikation (RVK) kann eine Bibliothek ihren Bestand nach Sachgebieten gegliedert
aufstellen. Die RVK ist mittlerweile in 33 Fachgebieten hierarchisch geordnet, die vergebenen Notationen sind vier-
bis fünfstellig. Die Zahlenkombination allein ist aber für den Nutzer oft wenig verständlich. Hier setzte das Projekt an
und entwickelte eine Möglichkeit, die Notationen für den Nutzer unabhängig vom Bibliothekssystem klarer zu
visualisieren: Mit Hilfe eines Javascript-Snippets und der von der UB-Regensburg angebotenen RVK-API kann dem Nutzer der
Klarname der Notation und erweitert der gesamte RVK-Notationsbaum mit allen Abhängigkeiten angezeigt werden.



Projektträger
-------------

Die Realisierung des Projekts erfolgt im Rahmen der gemeinsamen Entwicklungsprojekte der strategischen Allianz
(Dez. 2007) zwischen Bibliotheksverbund Bayern (BVB) und Kooperativem Bibliotheksverbund Berlin-Brandenburg (KOBV).

Arbeitsverteilung im Projekt

Bibliotheksverbund Bayern (BVB)
- Erstellung von Links zur direkten Nachrecherche (Lateralsuche) von RVK-Notationen
- textliche Visualisierung der RVK-Notation durch ein Javascript-Snippet

Kooperativer Bibliotheksverbund Berlin-Brandenburg (KOBV)
- Generalisierung des Javascript-Codes
- Anpassungen des Codes an die RVK-API (Live-Schaltung Juni 2013)
- Test des Codes mit den Pilotbibliotheken UB Regensburg (SISIS) und TU Berlin (PRIMO)
- Dokumentation
- Veröffentlichung



Erläuterung
-----------

Wir der hier angebotene Code in das Frontend des Bibliothekskatalogs (Browser) eingebaut, sorgt die Javascript-Datei bei
Aufruf eines Katalogisats (unabhängig vom Bibliotheksinformationssystem) mit RVK-Notationen dafür, die detaillierte
Benennung für die vorhandenen RVK-Notationen via RVK-API (bereitgestellt durch die UB Regensburg) abzugleichen und dem
Nutzer anzuzeigen. Dabei wird nun die direkte Benennung/der Klarname der Notation angezeigt, bei einem Klick auf diesen
Bereich (diese Anzeige kann individuell durch Stylesheets beeinflusst werden, z.B. mittels eines (+)-Zeichen oder durch
das Einfügen eines Mouse-Over-Effekts) wird der gesamte RVK-Notationsbaum mit allen Abhängigkeiten gezeigt.

Beispiel
RVK-Notation PZ 3300

mit Javascript Datei
PZ 3300: Schuldrecht, insbesondere Vertragsrecht

ausgeklappt
PZ 3300: Schuldrecht, insbesondere Vertragsrecht
PZ 3000 - PZ 3800: Computerrecht, EDV-Recht, Recht des Internet
PZ: Datenverarbeitung und Recht
P: Rechtswissenschaft



Dateien
-------

LICENCE.txt                Lizenz für die Verwendung von RVK Visual.
README.txt                 Diese Erläuterungen zum Projekt. Dokumentation.
rvk-visual.js              Source Code
rvk-visual.css             Einfaches Stylesheet
rvk-visual-example.html    Einfaches Beispiel für die Verwendung von RVK Visual
rvk-visual-examples.html   Weitere Beispiele für die Verwendung mit unterschiedlichen Konfigurationen auf einer Seite
images/
  minus.png                Icon zum Einklappen des RVK-Notationsbaum (vom Beispiel verwendet)
  plus.png                 Icon zum Ausklappen des RVK-Notationsbaum (vom Beispiel verwendet)



Funktion
--------

Die Javascript-Datei arbeitet in mehreren Schritten.

- Zunächst wird die Webseite bei Aufruf nach RVK-Notationen abgesucht
- Werden RVK-Notationen gefunden, wird für jede einzelnen Notation die RVK-API (UB Regensburg) angefragt
- Die RVK-API antwortet (mit der Benennung/dem Klarnamen und dem abhängigen Baum) im Format XML, JSON oder JSON
- Das Javascript ersetzt die RVK-Notation mit der Benennung/dem Klarnamen und dem Wurzelbaum
- Bei Klick auf die Notation/Benennung öffnet sich der Baum

Für die Auflösung der Notationen muss die RVK-API ansprechbar sein. Sollte dies nicht der Fall sein, wird die Notation
nicht aufgelöst. Es erscheint keine Fehlermeldung.



Verwendung
----------

Die Javascript-Datei sowie die Stylesheet-Datei müssen auf dem gleichen Server wie die anderen für die Darstellung der
Webseite benötigten Dateien abgelegt werden.
Um RVK Visual zu verwenden, müssen folgende zwei Zeilen Code in die Header-Section der auszuliefernden Webseite
eingebunden werden:

<link href="rvk-visual.css" type="text/css" rel="stylesheet" />
<script src="rvk-visual.js" type="application/javascript"></script>


CSS-Class
Tag



Erklärungen

<div class="rvklink">PZ 3300</div>

wird umgewandelt in

<div class="rvklink" name="PZ 3300">
    <div class="rvk-visual-details">
        PZ 3300: Schuldrecht, insbesondere Vertragsrecht
        <div class="rvk-visual-list">
            <ul>
               <li>

               </li>
            </ul>
        </div>
    </div>
</div>


_____________________________________________________

Release/ Freigabe

Der Code gemeinsam mit einer Kurzdokumentation wird freigegeben unter der MIT Lizenz.



Anhang

Kurzdokumentation der RVK-API unter: http://rvk.uni-regensburg.de/api/
