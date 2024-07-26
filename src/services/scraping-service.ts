import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

type ScrapingServiceConfig = {
    baseUrl?: string;
    userAgent?: string;
}

type ScrapedData = {
    href: string;
    imageSrc: string;
    createdBy: string;
    createdByImg: string;
    marketCap: string;
    replies: string;
    description: string;
};

class ScrapingService {
    private config: ScrapingServiceConfig;
    private userAgent: string;

    constructor(config: ScrapingServiceConfig = {}) {
        this.config = config;
        this.userAgent = this.config.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    }

    private async fetch(url: string): Promise<string> {
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized'],
            timeout: 50000
        });
        const page = await browser.newPage();
        await page.setUserAgent(this.userAgent);
        await page.goto(url, { waitUntil: 'networkidle2' });
        const content = await page.content();
        await browser.close();
        return content;
    }

    public async scrapePumpFunBoard(url: string, selector: string): Promise<ScrapedData[]> {
        try {
            const content = await this.fetch(url);
            const $ = cheerio.load(content);

            const data: ScrapedData[] = [];
            $(selector).each((i, el) => {
                const href = $(el).attr('href') ?? '';
                const imageSrc = $(el).find('img').attr('src') ?? '';
                const createdBy = $(el).find('button span span').text().trim() ?? '';
                const createdByImg = $(el).find('button span img').attr('src') ?? '';
                const marketCap = $(el).find('div.text-green-300').text().trim() ?? '';
                const replies = $(el).find('p.text-xs:contains("replies")').text().trim() ?? '';
                const description = $(el).find('p.text-sm').text().trim() ?? '';

                data.push({
                    href,
                    imageSrc,
                    createdBy,
                    createdByImg,
                    marketCap,
                    replies,
                    description,
                });
            });

            return data;
        } catch (error) {
            throw new Error(`Failed to scrape ${url}: ${(error as Error).message}`);
        }
    }
}

export default ScrapingService;
