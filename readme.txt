RVK-VISUAL

==========

Visualisierung von RVK-Notationen mittels Javascript



Projektbeschreibung "Contentvisualisierung für Bibliothekskataloge"<p>

Bereits seit Ende der 2000er Jahre wurde im Bibliotheksumfeld unter dem Stichwort Katalog 2.0 verschiedene Verfahren zur verbesserten Präsentation von hochwertigen Kataloginhalten thematisiert. Contentvisualisierung ist hierbei unterstützendes Werkzeug zur Wissensexploration und zur Eingrenzung von Suchergebnissen.
Mit der Regensburger Verbundklassifikation (RVK) kann eine Bibliothek ihren Bestand nach Sachgebieten gegliedert aufstellen. Die RVK ist mittlerweile in 33 Fachgebieten hierarchisch geordnet, die vergebenen Notationen sind vier- bis fünfstellig. Die Zahlenkombination allein ist aber für den Nutzer oft wenig verständlich. Hier setzte das Projekt an und entwickelte eine Möglichkeit, die Notationen für den Nutzer unabhängig vom Bibliothekssystem klarer zu visualisieren: 
Mit Hilfe eines Javascript-Snippets und der von der UB-Regensburg angebotenen RVK-API kann dem Nutzer der Klarname der Notation und erweitert der gesamte RVK-Notationsbaum mit allen Abhägigkeiten angezeigt werden.



Projektträger

Bayerische Bibliotheksverbund (BVB), Kooperative Bibliotheksverbund Berlin-Brandenburg (KOBV)
Die Realisierung des Projekts erfolgt im Rahmen der gemeinsamen Entwicklungsprojekte der strategischen Allianz (Dez. 2007) zwischen KOBV und BVB.

Arbeitsverteilung im Projekt
- Erstellung von Links zur direkten Nachrecherche (Lateralsuche) von RVK-Notationen --> BVB, 2011
- textliche Visualisierung der RVK-Notation durch ein Javascript-Snippet --> BVB, 2011
- Generalisierung des Javascript-Codes --> KOBV, 2012
- Anpassungen des Codes an die RVK-API (Live-Schaltung Juni 2013) --> KOBV, 2013
- Test des Codes mit verschiedenen Bibliotheken (UB Regensburg, TU Berlin) --> KOBV, 2013
- Veröffentlichung, Dokumentation --> KOBV, 2014



Erläuterung

Wir der hier angebotene Code in das Frontend des Bibliothekskatalogs (Browser) eingebaut, sorgt die Javascript-Datei bei Aufruf eines Katalogisats (unabhängig vom Bibliotheksinformationssystem) mit RVK-Notationen dafür, die detaillierte Benennung für die vorhandenen RVK-Notationen via RVK-API (bereitgestellt durch die UB Regensburg) abzugleichen und dem Nutzer anzuzeigen. Dabei wird nun die direkte Benennung/der Klarname der Notation angezeigt, bei einem Klick auf diesen Bereich (diese Anzeige kann individuell durch Stylesheets beeinflusst werden, z.B. mittels eines (+)-Zeichen oder durch das Einfügen eines Mouse-Over-Effekts) wird der gesamte RVK-Notationsbaum mit allen Abhängigkeiten gezeigt.

Beispiel
RVK-Notation PZ 3300

mit Javascript_Datei
PZ 3300: Schuldrecht, insbesondere Vertragsrecht

ausgeklappt
PZ 3300: Schuldrecht, insbesondere Vertragsrecht
PZ 3000 - PZ 3800: Computerrecht, EDV-Recht, Recht des Internet
PZ: Datenverarbeitung und Recht
P: Rechtswissenschaft



Funktion

Die Javascript-Datei enthält mehrere Arbeitsschritte. 
- Zunächst wird die Webseite bei Aufruf nach RVK-Notationen abgesucht
  (function rvk_stringifyRVKLinks)
- Werden RVK-Notationen gefunden, wird für jede einzelnen Notation die RVK-API (UB Regensburg) angefragt
  (function rvk_getRVKData(rvk))
- Die RVK-API antwortet (mit der Benennung/dem Klarnamen und dem abhängigen Baum) im Format XML, JSON oder JSON
  (function rvk_parseRequest(response))
- Das Javascript ersetzt die RVK-Notation mit der Benennung/dem Klarnamen und dem Wurzelbaum
  (function rvk_visualize (rvk_array,notation))
- Bei Klick auf die Notation/Benennung öffnet sich der Baum
  (function rvk_path(node) ; function rvk_pathAsArray(node,key) ; function rvk_notation(node))

Für die Auflösung der Notationen muss die RVK-API ansprechbar sein. Sollte dies nicht der Fall sein, wird die Notation nicht aufgelöst. Es erscheint keine Fehlermeldung.



Installation

Die Javascript-Datei sowie die Stylesheet-Datei müssen am gleichen Ort wie die anderen für die Darstellung der Webseite benötigten Dateien abgelegt werden.

Damit die Javascript-Datei korrekt arbeitet, müssen folgende zwei Zeilen Code in die Header-Section der auszuliefernden Webseite eingebunden werden:

< link href="rvk_style.css" type="text/css" rel="stylesheet" >
< script src="rvk_links.js" type="application/javascript"></script >.



Benöigte Konfiguration

Um RVK-Notationen auffinden zu könen, müssen folgende Anpassungen vorgenommen werden.
Im Code der Javascript-Datei "rvk_links.js" werden die RVK Notationen über div-Klassen mit der Bezeichnung 

"rvklink" 
<div class='rvklink'>PZ 3300</div>

als RVK-Notation erkannt und dann automatisch die in der Javascript-Datei vordefinierten Arbeitsschritte angeworfen.

Werden die RVK-Notationen im Code der auszuliefernden Webseite mit einem anderen Element als <div> gekennzeichnet (Beispiel von vielen PRIMO-Installationen durch einen Link <a>), muss dies

a. in der Javascript-Datei angepasst werden:
   Ersetzen Sie im Code in der Zeile 36

   function rvk_stringifyRVKLinks() {
      var arr = new Array();
-->   arr = document.getElementsByTagName( "a" );

      for(var i=0; i < arr.length; i++)
      {
           var tagObj = arr[i];
           if (tagObj.className==="rvklink") {
                 var rvkTag=tagObj.innerHTML;
                 rvkTag=rvkTag.replace(/\ /,"+");
                 tagObj.setAttribute("name",tagObj.innerHTML);
                 rvk_getRVKData(rvkTag);
           }
      }
   }
   
   Für den Speizialfall eines PRIMO-Kataloges haben wir eine passende Javascipt-Datei verfasst: "rvk_links_primo.js".
   
b. muss das beschreibende Element im Code der auszuliefernden Webseite mit der Benennung "rvklink" versehen werden:
   Damit die RVK-Notationen im System gefunden werden können, müssen Sie also auch dementsprechend im Website Code 
   gekennzeichnet werden.

   <span class="rvk">NR 6910</span> wird zu <span class="rvklink">NR 6910</span>.



Release/ Freigabe
Der Code gemeinsam mit einer Kurzdokumentation wird freigegeben unter der Lizenz GNU GPLv3.



Anhang
Kurzdokumentation der RVK-API unter: http://rvk.uni-regensburg.de/api/ 
