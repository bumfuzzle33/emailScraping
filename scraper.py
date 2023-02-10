import requests
import re

scrapeTarget = "https://journalarjass.com/index.php/ARJASS/article/view/"
scrapedMails = []
start = 1
end = 400
for i in range(start, end+1):
    print(f'{i} out of {end}')
    scrapeUrl = f'{scrapeTarget}{i}'

    req = requests.get(url = scrapeUrl)
    resText = req.text
    matchMail = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', resText)
    scrapedMails.append(matchMail)

print(scrapedMails)

file = open("scrapedMails.txt", "a")

for i in range(len(scrapedMails)):
    for j in range(len(scrapedMails[i])):
        file.write(f'{scrapedMails[i][j]}\n')
    
file.close()