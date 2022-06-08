// Bring in unit groups (316 groups)
import unitGroups from '../data/jobs.json'

/**
 * Event hanlder for the jobs-by-credential endpoint.
 */
export default defineEventHandler(async (event) => {
  const query = useQuery(event) //  duration?, credential, [keywords]

  const search = {}

  if (query.duration) {
    // we are searching for duration AND credential AND 1 or more keywords
    search.duration = query.duration
    search.credential = query.credential
    search.keywords = new Array(query.keywords)
  } else {
    // we are searching only for credential AND 1 or more keywords
    search.credential = query.credential
    search.keywords = new Array(query.keywords)
  }

  const relatedGroups = findRelatedUnitGroups(
    search.credential,
    search.keywords,
    search.duration
  )

  console.log(relatedGroups)
  return relatedGroups

  // TODO - Search through relatedGroups, get an array of related job objects including job titles and noc codes.

  // TODO - Return our results object
})

/**
 *
 * @param {String} credential
 * @param {Array<String>} keywords
 * @param {String} duration
 */
function findRelatedUnitGroups(credential, keywords, duration = false) {
  const jobList = []
  const relatedGroups = unitGroups.reduce((matchedGroups, unitGroup) => {
    const employmentRequirements = unitGroup.details.find((detail) => {
      return detail.section === 'Employment requirements'
    }).details

    // Stringify our employment requirements for fast regex searching.
    const stringOfRequirements = employmentRequirements.join(' ')

    // Matches if at least 1 of the keywords is in the employment requirements
    const hasKeywordMatch = keywords.some((keyword) => {
      return stringOfRequirements.match(new RegExp(keyword, 'gi'))
    })

    // If not, we're done here. This unit group does not meet our requirements.
    if (!hasKeywordMatch) return

    // Consider duration and educational requirements.
    const educationKeywords = duration ? [duration, credential] : [credential]

    // Matches if all educational requirements are met. Iterating over each educational requirement individually for best results.
    const hasEducationMatch = educationKeywords.every((keyword) => {
      for (const requirement of employmentRequirements) {
        if (requirement.match(new RegExp(keyword, 'gi'))) {
          return true
        }
      }
    })

    if (!hasEducationMatch) return

    // Boolean set to true if requires "years of experience". False otherwise.
    const doesRequireExperience = stringOfRequirements.match(
      new RegExp('years of experience', 'gi')
    )

    // Split off relivant data from Unit Group
    const nocNumber = unitGroup.noc_number
    const groupTitle = unitGroup.occupation
    const requirements = unitGroup.details.find((detail) => {
      return detail.section === 'Employment requirements'
    }).details
    const description = unitGroup.details.find((detail) => {
      return detail.section === 'Main duties'
    }).details
    const jobs = unitGroup.details.find((detail) => {
      return detail.section === 'Illustrative example(s)'
    }).details

    // Add each of our job objects to our list of applicable jobs for later use outside this block.
    jobs.forEach((job) => {
      jobList.push({
        noc_number: nocNumber,
        title: job,
      })
    })

    // Add our unit group to our list of related groups.
    const object = {
      noc_number: nocNumber,
      group_title: groupTitle,
      requirements,
      description,
    }
    console.log(object)

    matchedGroups.add(object)
    return matchedGroups
  })

  return {
    groups: relatedGroups,
    jobs: jobList,
  }
}
