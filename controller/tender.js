const tenderModel = require("../models/tender");
const { toTitleCase, toUpperCase, generateUUID } = require("../config/functions")
const { regionData, geopoliticalData } = require("../config/countriesData");

class Tender {

    async getSingleTender(req, res) {
        const tenderId = req.params.tenderId;
        if (!tenderId) {
            return res.json({ error: "All filled must be required" });
        } else {
            try {
                let singleTender = await tenderModel.find({ tenderId: tenderId });
                if (singleTender) {
                    return res.json({ Product: singleTender });
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    async getAllTender(req, res) {
        try {
            const { approvedStatus, active, userRole } = req.body;

            const query = {};

            if (userRole === 3) {
                query.approvedStatus = true;
                query.active = true;
            } else if (userRole === 0 || userRole === 1 || userRole === 2) {
                if (approvedStatus !== undefined) {
                    query.approvedStatus = approvedStatus;
                }

                if (active !== undefined) {
                    query.active = active;
                }
            }

            const tenders = await tenderModel.find(query);

            if (tenders.length > 0) {
                return res.json({ tenders });
            } else {
                return res.json({ message: "No tenders found." });
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async postAddTender(req, res) {
        let {
            summary,
            sector,
            cpvNo,
            country,
            state,
            city,
            procurementSummarySummary,
            procurementSummaryDeadline,
            noticeType,
            totNo,
            documentNo,
            competition,
            financier,
            ownership,
            tenderValue,
            purchaser,
            paddress,
            pcity,
            pdistrict,
            pstate,
            ppin,
            ptelfax,
            email,
            url,
            description,
            organization,
            tenderDetailNoticeType
        } = req.body;

        // Validation
        if (
            !summary |
            !sector |
            !country |
            !state |
            !city |
            !procurementSummarySummary |
            !procurementSummaryDeadline |
            !noticeType |
            !totNo |
            !documentNo |
            !competition |
            !financier |
            !ownership |
            !tenderValue |
            !purchaser |
            !paddress |
            !pcity |
            !pdistrict |
            !pstate |
            !email |
            !url |
            !organization
        ) {
            return res.json({ error: "All filled must be required" });
        }
        else {
            try {
                summary = toTitleCase(summary);
                procurementSummarySummary = toTitleCase(procurementSummarySummary);
                documentNo = toUpperCase(documentNo);
                financier = toTitleCase(financier);
                paddress = toTitleCase(paddress);
                organization = toUpperCase(organization);

                const tenderId = generateUUID();

                const procurementSummary = {
                    country,
                    state,
                    city,
                    summary: procurementSummarySummary,
                    deadline: new Date(procurementSummaryDeadline)
                };

                const otherInformation = {
                    noticeType,
                    totNo,
                    documentNo,
                    competition,
                    financier,
                    ownership,
                    tenderValue
                };

                const purchaserDetail = {
                    purchaser,
                    address: paddress,
                    city: pcity,
                    district: pdistrict,
                    state: pstate,
                    pin: ppin,
                    telfax: ptelfax,
                    email,
                    url
                };

                const tenderDetail = {
                    description,
                    publishDate: new Date(),
                    organization,
                    noticeType: tenderDetailNoticeType
                };

                const newTender = new tenderModel({
                    tenderId,
                    summary,
                    sector,
                    cpvNo,
                    procurementSummary,
                    otherInformation,
                    purchaserDetail,
                    tenderDetail,
                    approvedStatus: false
                });

                newTender.save()
                    .then((data) => {
                        return res.json({
                            success: "Tender filled successfully.",
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });

            } catch (err) {
                console.log(err);
                return res.status(500).json({ error: err });
            }
        }
    }

    // Generalized search endpoint
    async search(req, res) {
        try {
            const query = {};

            const { region, geopolitical, country, sector, financier, state, city } = req.query;

            if (region && regionData.hasOwnProperty(region)) {
                const countriesInRegion = regionData[region];
                query['procurementSummary.country'] = { $in: countriesInRegion };
            }
            if (geopolitical && geopoliticalData.hasOwnProperty(geopolitical)) {
                const countriesInGeopolitical = geopoliticalData[geopolitical];
                query['procurementSummary.country'] = { $in: countriesInGeopolitical };
            }
            if (country) {
                query['procurementSummary.country'] = country;
            }
            if (sector) {
                query['sector'] = sector;
            }
            if (financier) {
                query['otherInformation.financier'] = financier;
            }
            if (state) {
                query['procurementSummary.state'] = state;
            }
            if (city) {
                query['procurementSummary.city'] = city;
            }

            const results = await tenderModel.find(query);

            res.json(results);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred during the search' });
        }
    };

    // Advanced search endpoint
    async advanceSearch(req, res) {
        try {
            const { totNo, documentNo, location, sector, cpvNo, finance, deadlineFrom, deadlineTo, postingFrom, postingTo, purchaserName, year, keywords } = req.body;

            const qwert = {};
            const query = {};

            if (totNo) {
                query['otherInformation.totNo'] = totNo;
            }

            if (documentNo) {
                query['otherInformation.documentNo'] = documentNo;
            }

            if (location) {
                if (Array.isArray(location)) {
                    const countries = [];
                    const regions = [];

                    location.forEach((item) => {
                        if (regionData.hasOwnProperty(item)) {
                            regions.push(item);
                        } else {
                            countries.push(item);
                        }
                    });

                    if (countries.length > 0) {
                        query['procurementSummary.country'] = { $in: countries };
                    }
                    if (regions.length > 0) {
                        const countriesInRegions = regions.reduce((acc, region) => {
                            return acc.concat(regionData[region]);
                        }, []);

                        if (query['procurementSummary.country']) {
                            query['procurementSummary.country'].$in = query[
                                'procurementSummary.country'
                            ].$in.concat(countriesInRegions);
                        } else {
                            query['procurementSummary.country'] = { $in: countriesInRegions };
                        }
                    }
                } else {
                    query['procurementSummary.country'] = location;
                }
            }

            if (sector && Array.isArray(sector)) {
                console.log(sector);
                query['sector'] = { $in: sector };
            } else if (sector) {
                query['sector'] = sector;
            }

            if (cpvNo) {
                query['cpvNo'] = cpvNo;
            }

            if (finance && Array.isArray(finance)) {
                console.log(finance);
                query['otherInformation.financier'] = { $in: finance };
            } else if (finance) {
                query['otherInformation.financier'] = finance;
            }

            if (deadlineFrom && deadlineTo) {
                query['procurementSummary.deadline'] = { $gte: new Date(deadlineFrom), $lte: new Date(deadlineTo) };
            } else if (deadlineFrom) {
                query['procurementSummary.deadline'] = { $gte: new Date(deadlineFrom) };
            } else if (deadlineTo) {
                query['procurementSummary.deadline'] = { $lte: new Date(deadlineTo) };
            }

            if (postingFrom && postingTo) {
                query['tenderDetail.publishDate'] = { $gte: new Date(postingFrom), $lte: new Date(postingTo) };
            } else if (postingFrom) {
                query['tenderDetail.publishDate'] = { $gte: new Date(postingFrom) };
            } else if (postingTo) {
                query['tenderDetail.publishDate'] = { $lte: new Date(postingTo) };
            }

            if (purchaserName) {
                purchaserName = toTitleCase(purchaserName);
                query['purchaserDetail.purchaser'] = purchaserName;
            }

            if (year) {
                const startYear = `${year}-01-01T00:00:00.000Z`;
                const endYear = `${year}-12-31T23:59:59.999Z`;

                query['tenderDetail.publishDate'] = {
                    $gte: startYear,
                    $lte: endYear
                };
            }

            if (keywords) {
                const keywordQuery = {
                    $or: [
                        { $text: { $search: keywords.join(' ') } }
                    ]
                };

                query.$and = [query, keywordQuery];
            }

            const tenders = await tenderModel.find(query);

            res.json(tenders);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error });
        }
    }

    async switchStatus(req, res) {
        try {
            const { tenderId } = req.params;

            const tender = await tenderModel.findById(tenderId);

            if (!tender) {
                return res.status(404).json({ error: "Tender not found." });
            }

            tender.approvedStatus = !tender.approvedStatus;

            await tender.save();

            return res.json({ message: "Approved status switched successfully.", tender });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

    async switchActive(req, res) {
        try {
            const { tenderId } = req.params;

            const tender = await tenderModel.findById(tenderId);

            if (!tender) {
                return res.status(404).json({ error: "Tender not found." });
            }

            tender.active = !tender.active;

            await tender.save();

            return res.json({ message: "Active status switched successfully.", tender });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

}

const tenderController = new Tender();
module.exports = tenderController;